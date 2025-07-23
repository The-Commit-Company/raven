import frappe
from frappe import _


@frappe.whitelist(methods=["GET"])
def get_action_defaults(action_id: str, message_id: str):
	"""
	Get the default values for a message action
	"""

	frappe.has_permission(doctype="Raven Message", doc=message_id, ptype="read", throw=True)
	action = frappe.get_doc("Raven Message Action", action_id)
	message = frappe.get_doc("Raven Message", message_id)

	# Loop through the fields in the action and get the default values from the message
	defaults = {}

	channel_doc = frappe.get_doc("Raven Channel", message.channel_id)
	workspace_id = channel_doc.workspace

	if not workspace_id:
		# Get the last workspace that this user has access to
		workspace_id = frappe.get_last_doc("Raven Workspace Member", {"user": frappe.session.user}).name

	url = frappe.utils.get_url(f"/raven/{workspace_id}")

	if channel_doc.is_thread:
		message_url = url + f"/threads/{message.channel_id}?message_id={message.name}"
	else:
		message_url = url + f"/{message.channel_id}?message_id={message.name}"

	for field in action.fields:
		if not field.default_value:
			continue

		if field.default_value_type == "Static":
			defaults[field.fieldname] = field.default_value

		if field.default_value_type == "Message Field":
			if field.default_value == "message_url":
				val = message_url
			elif field.default_value == "workspace_id":
				val = workspace_id
			else:
				val = message.get(field.default_value)
			if val:
				defaults[field.fieldname] = val

		if field.default_value_type == "Jinja":

			val = frappe.render_template(
				field.default_value, {"message": {"message_url": message_url, **message.as_dict()}}
			)

			if val:
				defaults[field.fieldname] = val

	return defaults


@frappe.whitelist(methods=["POST"])
def execute_action(action_id: str, message_id: str, values: dict):
	"""
	Execute a message action
	"""

	frappe.has_permission(doctype="Raven Message", doc=message_id, ptype="read", throw=True)
	action = frappe.get_doc("Raven Message Action", action_id)
	message = frappe.get_doc("Raven Message", message_id)

	if action.action == "Create Document":
		doc = frappe.get_doc({"doctype": action.document_type, **values})
		doc.insert()

		# Link message to the document if no link exists already
		if not message.link_doctype and not message.link_document:
			message.flags.editing_metadata = True
			message.link_doctype = doc.doctype
			message.link_document = doc.name
			# Ignore permissions to allow editing of the document
			message.save(ignore_permissions=True)

		return {"message": "Document created successfully", "document": doc.name, "doctype": doc.doctype}

	if action.action == "Custom Function":
		# Call the function with the values
		function_name = frappe.get_attr(action.custom_function_path)

		if function_name:
			return function_name(**values)
		else:
			frappe.throw(_("Function {0} not found").format(action.custom_function_path))

	if action.action == "Server Script":
		script = frappe.get_doc("Server Script", action.server_script)
		if script.disabled:
			frappe.throw(_("Server Script {0} is disabled").format(action.server_script))
		script.execute_method()
