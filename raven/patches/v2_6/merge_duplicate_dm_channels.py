import frappe
from frappe.query_builder.functions import Count


def execute():
	"""
	Merge duplicate DM channels into a single channel.

	Why this patch exists:
	Race conditions created multiple DM channels -
	Example: Multiple DM channels created for the same user pair like user1 _ user2 and user2 _ user1
	This patch consolidates them into one.

	While merging them into one, we need to ensure the following:
	1. For simplicity purpose, the channel id chosen as primary is the oldest one.
	2. All Linked records need to be updated to ensure that they point to the primary channel.
	3. Channel members need to be migrated to the primary channel.
	4. Duplicate channel members need to be deleted.

	Prerequisites: dm_user_1 and dm_user_2 must be populated via populate_dm_user_fields patch(which runs before this patch)
	"""

	raven_channel = frappe.qb.DocType("Raven Channel")
	duplicate_groups = (
		frappe.qb.from_(raven_channel)
		.select(raven_channel.dm_user_1, raven_channel.dm_user_2)
		.where(raven_channel.is_direct_message == 1)
		.where(raven_channel.dm_user_1.isnotnull())
		.where(raven_channel.dm_user_2.isnotnull())
		.groupby(raven_channel.dm_user_1, raven_channel.dm_user_2)
		.having(Count(raven_channel.name) > 1)
	).run(as_dict=True)

	if not duplicate_groups:
		return

	for group in duplicate_groups:
		merge_duplicate_group(group["dm_user_1"], group["dm_user_2"])


def merge_duplicate_group(dm_user_1: str, dm_user_2: str):
	"""
	Merge all duplicate channels for a user pair into the oldest one.
	The oldest channel becomes the primary, all others are deleted.
	"""
	raven_channel = frappe.qb.DocType("Raven Channel")
	channels = (
		frappe.qb.from_(raven_channel)
		.select(raven_channel.name)
		.where(raven_channel.is_direct_message == 1)
		.where(raven_channel.dm_user_1 == dm_user_1)
		.where(raven_channel.dm_user_2 == dm_user_2)
		.orderby(raven_channel.creation)
	).run(as_dict=True)

	if len(channels) < 2:
		return

	primary_channel = channels[0].name
	duplicate_channels = [c.name for c in channels[1:]]

	# Move all linked records from duplicates to primary
	migrate_linked_records(primary_channel, duplicate_channels)

	# Delete the duplicate channels
	frappe.db.sql(
		"DELETE FROM `tabRaven Channel` WHERE name IN %s",
		(duplicate_channels),
	)


def migrate_linked_records(primary_channel: str, duplicate_channels: list):
	"""
	Move all linked records from duplicate channels to the primary channel.
	"""

	linked_doctypes = [
		("Raven Message", "channel_id"),
		("Raven Message Reaction", "channel_id"),
		("Raven Pinned Channels", "channel_id"),
		("Raven Incoming Webhook", "channel_id"),
		("Raven Scheduler Event", "channel"),
		("Raven Scheduler Event", "dm"),
		("Raven Webhook", "channel_id"),
		("Raven Message Reaction", "channel_id"),
	]

	for doctype, field in linked_doctypes:
		table = frappe.qb.DocType(doctype)
		if not table:
			continue

		frappe.qb.update(table).set(field, primary_channel).where(
			table[field].isin(duplicate_channels)
		).run()


def migrate_channel_members(primary_channel: str, duplicate_channels: list):

	# Preserve admin status - if user was admin in any duplicate, make them admin in primary
	frappe.db.sql(
		"""
		UPDATE `tabRaven Channel Member`
		SET is_admin = 1
		WHERE channel_id = %s
		AND user_id IN (
			SELECT user_id FROM `tabRaven Channel Member`
			WHERE channel_id IN %s AND is_admin = 1
		)
		""",
		(primary_channel, duplicate_channels),
	)

	# Move members that don't already exist in primary
	frappe.db.sql(
		"""
		UPDATE `tabRaven Channel Member`
		SET channel_id = %s
		WHERE channel_id IN %s
		AND user_id NOT IN (
			SELECT user_id FROM (
				SELECT user_id FROM `tabRaven Channel Member` WHERE channel_id = %s
			) AS existing_members
		)
		""",
		(primary_channel, duplicate_channels, primary_channel),
	)

	# Delete remaining members from duplicates (they already exist in primary)
	frappe.db.sql(
		"DELETE FROM `tabRaven Channel Member` WHERE channel_id IN %s",
		(duplicate_channels),
	)
