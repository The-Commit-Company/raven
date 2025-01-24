import frappe
from frappe.utils.change_log import get_versions


@frappe.whitelist(allow_guest=True)
def get_client_id():
	"""
	API to fetch the client ID, site name (for socket), App name (for display), Raven version and logo. These will be stored on the device
	"""
	app_name = frappe.get_website_settings("app_name") or frappe.get_system_settings("app_name")

	if not app_name or app_name == "Frappe":
		app_name = "Raven"

	all_app_versions = get_versions()

	app_versions = {k: v["version"] for k, v in all_app_versions.items()}
	raven_version = app_versions["raven"]
	frappe_version = app_versions["frappe"]

	return {
		"client_id": frappe.db.get_single_value("Raven Settings", "oauth_client"),
		"system_timezone": frappe.get_system_settings("time_zone"),
		"app_name": app_name,
		"sitename": frappe.local.site,
		"raven_version": raven_version,
		"frappe_version": frappe_version,
		"logo": frappe.db.get_single_value("Navbar Settings", "app_logo")
		or "/assets/raven/raven-logo.png",
	}


# TODO: API to fetch boot information for the app - settings like GIF API key etc.
