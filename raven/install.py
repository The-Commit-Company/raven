import frappe


def after_install():
	add_standard_navbar_items()
	create_general_channel()


def create_general_channel():
	if not frappe.db.exists("Raven Channel", "general"):
		channel = frappe.new_doc("Raven Channel")
		channel.channel_name = "General"
		channel.name = "general"
		channel.type = "Open"
		channel.save(ignore_permissions=True)
		# Part of installation, hence needs to be committed manually
		frappe.db.commit()  # nosemgrep


def add_standard_navbar_items():
	navbar_settings = frappe.get_single("Navbar Settings")

	raven_navbar_items = [
		{
			"item_label": "Raven",
			"item_type": "Route",
			"route": "/raven",
			"is_standard": 1,
		}
	]

	current_navbar_items = navbar_settings.settings_dropdown
	navbar_settings.set("settings_dropdown", [])

	for item in raven_navbar_items:
		current_labels = [item.get("item_label") for item in current_navbar_items]
		if not item.get("item_label") in current_labels:
			navbar_settings.append("settings_dropdown", item)

	for item in current_navbar_items:
		navbar_settings.append(
			"settings_dropdown",
			{
				"item_label": item.item_label,
				"item_type": item.item_type,
				"route": item.route,
				"action": item.action,
				"is_standard": item.is_standard,
				"hidden": item.hidden,
			},
		)

	navbar_settings.save()
