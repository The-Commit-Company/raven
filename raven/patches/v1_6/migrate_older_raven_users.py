import frappe


def execute():
	"""
	Migrate Raven User to have the "type" field set for older Raven Users
	"""

	users = frappe.get_all("Raven User", filters={"type": ["in", ["", None]]}, pluck="name", limit=5)

	for user in users:
		frappe.db.set_value("Raven User", user, "type", "User")

	frappe.db.commit()
