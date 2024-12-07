import frappe


def execute():
	"""
	Creating a default workspace for all existing users and channels
	"""
	default_workspace = frappe.get_doc(
		{
			"doctype": "Raven Workspace",
			"workspace_name": "Raven",
			"type": "Public",
		}
	)
	default_workspace.insert(ignore_permissions=True)

	# Make all users a member of this workspace and set them as admins
	users = frappe.get_all("Raven User")
	for user in users:
		frappe.get_doc(
			{
				"doctype": "Raven Workspace Member",
				"workspace": default_workspace.name,
				"user": user.name,
				"is_admin": True,
			}
		).insert(ignore_permissions=True)

	# Make all existing channels a part of this workspace
	channels = frappe.get_all(
		"Raven Channel", filters={"is_direct_message": 0, "is_dm_thread": 0}, fields=["name"]
	)
	for channel in channels:
		frappe.db.set_value(
			"Raven Channel", channel.name, "workspace", default_workspace.name, update_modified=False
		)
