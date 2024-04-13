import click
import frappe
from frappe.desk.page.setup_wizard.setup_wizard import make_records


def after_install():
	try:
		print("Setting up Raven...")
		add_standard_navbar_items()
		create_general_channel()

		click.secho("Thank you for installing Raven!", fg="green")

	except Exception as e:
		BUG_REPORT_URL = "https://github.com/The-Commit-Company/Raven/issues/new"
		click.secho(
			"Installation for Raven failed due to an error."
			" Please try re-installing the app or"
			f" report the issue on {BUG_REPORT_URL} if not resolved.",
			fg="bright_red",
		)
		raise e


def create_general_channel():
	channel = [
		{"doctype": "Raven Channel", "name": "general", "type": "Open", "channel_name": "General"}
	]

	make_records(channel)


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
