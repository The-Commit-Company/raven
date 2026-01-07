import frappe


def execute():
	"""
	Populate the dm_user_1 and dm_user_2 fields for existing DM channels
	"""

	dm_channels = frappe.get_all(
		"Raven Channel", filters={"is_direct_message": 1}, fields=["name", "channel_name"]
	)

	for channel in dm_channels:
		users = channel.channel_name.split(" _ ")
		if len(users) == 2:
			if users[0] > users[1]:
				dm_user_1, dm_user_2 = users[0], users[1]
			else:
				dm_user_1, dm_user_2 = users[1], users[0]
		else:
			dm_user_1 = dm_user_2 = users[0]

		frappe.db.set_value(
			"Raven Channel",
			channel.name,
			{"dm_user_1": dm_user_1, "dm_user_2": dm_user_2},
			update_modified=False,
		)
