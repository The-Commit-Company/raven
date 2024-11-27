import frappe


def boot_session(bootinfo):

	bootinfo.show_raven_chat_on_desk = frappe.db.get_single_value(
		"Raven Settings", "show_raven_on_desk"
	)

	tenor_api_key = frappe.db.get_single_value("Raven Settings", "tenor_api_key")

	document_link_override = frappe.get_hooks("raven_document_link_override")

	chat_style = frappe.db.get_value("Raven User", frappe.session.user, "chat_style")

	if document_link_override and len(document_link_override) > 0:
		bootinfo.raven_document_link_override = True

	if tenor_api_key:
		bootinfo.tenor_api_key = tenor_api_key
	else:
		bootinfo.tenor_api_key = "AIzaSyAWkuhLwbMxOlvn_o5fxBke1grUZ7F3ma4"  # should we remove this?

	bootinfo.chat_style = chat_style if chat_style else "Simple"
