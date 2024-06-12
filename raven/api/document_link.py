import frappe
from frappe.desk.utils import slug


@frappe.whitelist(methods=["GET"])
def get(doctype, docname):

	document_link_override = frappe.get_hooks("raven_document_link_override")
	if document_link_override and len(document_link_override) > 0:

		# Loop over all the hooks and return the first non-None value
		for hook in document_link_override:
			link = frappe.get_attr(hook)(doctype, docname)
			if link:
				return link

	return f"/app/{slug(doctype)}/{docname}"
