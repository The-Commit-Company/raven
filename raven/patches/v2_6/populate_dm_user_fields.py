import frappe


def execute():
	"""
	Populate the dm_user_1 and dm_user_2 fields for existing DM channels
	"""

	dm_channels = frappe.get_all(
		"Raven Channel", filters={"is_direct_message": 1}, fields=["name", "channel_name"]
	)

	for channel in dm_channels:
		# Reason for using Raven Channel Member instead of channel_name:
		# channel_name is a Data field, so in case of change of Raven User ID, then the data field becomes stale.
		# users = channel.channel_name.split(" _ ")
		users = frappe.get_all(
			"Raven Channel Member",
			filters={"channel_id": channel.name},
			pluck="user_id",
		)

		if len(users) == 2:
			if users[0] > users[1]:
				dm_user_1, dm_user_2 = users[0], users[1]
			else:
				dm_user_1, dm_user_2 = users[1], users[0]
		elif len(users) == 1:
			dm_user_1 = dm_user_2 = users[0]
		else:
			frappe.log_error(
				f"DM channel {channel.name} has {len(users)} users, expected 1 or 2",
				"Patch: populate_dm_user_fields",
			)

		frappe.db.set_value(
			"Raven Channel",
			channel.name,
			{"dm_user_1": dm_user_1, "dm_user_2": dm_user_2},
			update_modified=False,
		)
