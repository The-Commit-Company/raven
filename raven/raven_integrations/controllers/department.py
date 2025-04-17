import frappe


def after_insert(doc, method):
	"""
	Check if auto creation of Department channel is enabled.
	If yes, then create a new Raven Channel
	"""
	if doc.is_group or doc.disabled:
		return

	channel_type = get_auto_create_department_channel_type()

	if not channel_type:
		return

	department_channel = frappe.new_doc("Raven Channel")

	channel_name = get_channel_name_for_department(doc.name)

	department_channel.channel_name = channel_name
	department_channel.type = channel_type
	department_channel.channel_description = f"Channel for Department - {doc.department_name}"
	department_channel.is_synced = 1
	department_channel.linked_doctype = "Department"
	department_channel.linked_document = doc.name

	# Get the workspace based on the company of the department else use the default workspace
	workspace = frappe.get_all(
		"Raven HR Company Workspace", filters={"company": doc.company}, pluck="raven_workspace", limit=1
	)

	if workspace:
		department_channel.workspace = workspace[0]

		department_channel.insert(ignore_permissions=True)


def on_update(doc, method):
	linked_channels = frappe.get_all(
		"Raven Channel",
		{"linked_doctype": "Department", "linked_document": doc.name},
		pluck="name",
		limit=1,
	)

	channel_name = get_channel_name_for_department(doc.name)

	for channel in linked_channels:
		# Update the description and name if changed
		frappe.db.set_value(
			"Raven Channel",
			channel,
			{
				"channel_name": channel_name,
			},
		)


def on_trash(doc, method):
	frappe.db.delete("Raven Channel", {"linked_doctype": "Department", "linked_document": doc.name})


def get_auto_create_department_channel_type() -> str | None:
	raven_settings = frappe.get_single("Raven Settings")

	if raven_settings.auto_create_department_channel:
		return (
			raven_settings.department_channel_type if raven_settings.department_channel_type else "Private"
		)
	else:
		return None


def get_channel_name_for_department(department):
	channel_name = ""

	prev_character = ""
	for char in department:
		# If there are more than one "-" in a row, replace them
		if char != " " and char != "-":
			channel_name += char
			prev_character = char

		elif prev_character != "-":
			channel_name += "-"
			prev_character = "-"

	return channel_name
