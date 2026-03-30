import frappe


def execute():
	"""
	Fix duplicate DM channels by populating dm_user fields and merging duplicates in a single pass.

	The unique constraint on dm_user_1/dm_user_2 gets added via on_doctype_update() before patches run.
	If we populate dm_user fields first for ALL channels, duplicates would violate the constraint.
	So we must process channels one by one - either set dm_user fields OR merge into existing.

	Logic:
	1. Loop through all DM channels (oldest first)
	2. For each channel, get canonical user pair from channel members
	3. If pair already processed → merge this channel into primary
	4. If pair is new → set dm_user fields, mark as primary
	"""

	# track processed pairs: {(dm_user_1, dm_user_2): primary_channel_id}
	processed_pairs = {}

	raven_channel = frappe.qb.DocType("Raven Channel")

	# get all DM channels ordered by creation (oldest first becomes primary)
	dm_channels = (
		frappe.qb.from_(raven_channel)
		.select(raven_channel.name)
		.where(raven_channel.is_direct_message == 1)
		.orderby(raven_channel.creation)
	).run(as_dict=True)

	for channel in dm_channels:
		# get canonical user pair from channel members
		user_pair = get_user_pair_from_members(channel.name)

		if not user_pair:
			frappe.log_error(
				f"Could not determine user pair for DM channel {channel.name}",
				"Patch: fix_duplicate_dm_channels",
			)
			continue

		dm_user_1, dm_user_2 = user_pair
		pair_key = (dm_user_1, dm_user_2)

		# if the pair has already been processed, merge the channel into the primary
		if pair_key in processed_pairs:
			# duplicate - merge into primary
			primary_channel = processed_pairs[pair_key]
			merge_channel_into_primary(channel.name, primary_channel)
		else:
			# first occurrence - set dm_user fields and track as primary
			frappe.db.set_value(
				"Raven Channel",
				channel.name,
				{"dm_user_1": dm_user_1, "dm_user_2": dm_user_2},
				update_modified=False,
			)
			processed_pairs[pair_key] = channel.name


def get_user_pair_from_members(channel_id: str) -> tuple | None:
	"""Get canonical user pair from channel members. Returns (dm_user_1, dm_user_2) or None."""
	users = frappe.get_all(
		"Raven Channel Member",
		filters={"channel_id": channel_id},
		pluck="user_id",
	)

	if len(users) == 2:
		# Canonical order: dm_user_1 > dm_user_2 (alphabetically)
		if users[0] > users[1]:
			return (users[0], users[1])
		return (users[1], users[0])
	elif len(users) == 1:
		# Self message
		return (users[0], users[0])

	return None


def merge_channel_into_primary(duplicate_channel: str, primary_channel: str):
	"""Merge a duplicate channel into the primary channel."""

	# Migrate all linked records
	migrate_linked_records(primary_channel, duplicate_channel)

	# Migrate channel members
	migrate_channel_members(primary_channel, duplicate_channel)

	# Delete the duplicate channel
	frappe.db.delete("Raven Channel", {"name": duplicate_channel})


def migrate_linked_records(primary_channel: str, duplicate_channel: str):
	"""Move all linked records from duplicate to primary channel."""

	linked_doctypes = [
		("Raven Message", "channel_id"),
		("Raven Message Reaction", "channel_id"),
		("Raven Pinned Channels", "channel_id"),
		("Raven Incoming Webhook", "channel_id"),
		("Raven Scheduler Event", "channel"),
		("Raven Scheduler Event", "dm"),
		("Raven Webhook", "channel_id"),
	]

	for doctype, field in linked_doctypes:
		table = frappe.qb.DocType(doctype)
		if not table:
			continue

		frappe.qb.update(table).set(field, primary_channel).where(
			table[field] == duplicate_channel
		).run()


def migrate_channel_members(primary_channel: str, duplicate_channel: str):
	"""Migrate members from duplicate to primary, preserving admin status."""

	# Preserve admin status - if user was admin in duplicate, make them admin in primary
	frappe.db.sql(
		"""
		UPDATE `tabRaven Channel Member`
		SET is_admin = 1
		WHERE channel_id = %s
		AND user_id IN (
			SELECT user_id FROM (
				SELECT user_id FROM `tabRaven Channel Member`
				WHERE channel_id = %s AND is_admin = 1
			) AS admin_users
		)
		""",
		(primary_channel, duplicate_channel),
	)

	# Move members that don't already exist in primary
	frappe.db.sql(
		"""
		UPDATE `tabRaven Channel Member`
		SET channel_id = %s
		WHERE channel_id = %s
		AND user_id NOT IN (
			SELECT user_id FROM (
				SELECT user_id FROM `tabRaven Channel Member` WHERE channel_id = %s
			) AS existing_members
		)
		""",
		(primary_channel, duplicate_channel, primary_channel),
	)

	# Delete remaining members from duplicate (they already exist in primary)
	frappe.db.delete("Raven Channel Member", {"channel_id": duplicate_channel})
