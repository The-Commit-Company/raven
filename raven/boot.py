import frappe


def boot_session(bootinfo):

	bootinfo.show_raven_chat_on_desk = frappe.db.get_single_value(
		"Raven Settings", "show_raven_on_desk"
	)

	tenor_api_key = frappe.db.get_single_value("Raven Settings", "tenor_api_key")

	if tenor_api_key:
		bootinfo.tenor_api_key = tenor_api_key
	else:
		bootinfo.tenor_api_key = "AIzaSyAWkuhLwbMxOlvn_o5fxBke1grUZ7F3ma4"  # should we remove this?
