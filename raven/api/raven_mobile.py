import frappe


@frappe.whitelist(allow_guest=True)
def get_client_id():
	return frappe.db.get_single_value("Raven Settings", "oauth_client")
