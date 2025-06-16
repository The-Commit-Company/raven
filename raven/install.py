import click
import frappe
from frappe.desk.page.setup_wizard.setup_wizard import add_all_roles_to, make_records


def after_install():
	try:
		print("Setting up Raven...")
		add_all_roles_to("Administrator")
		create_raven_user_for_administrator()
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


def create_raven_user_for_administrator():

	if not frappe.db.exists("Raven User", {"user": "Administrator"}):
		frappe.get_doc(
			{
				"doctype": "Raven User",
				"user": "Administrator",
				"full_name": "Administrator",
				"type": "User",
			}
		).insert(ignore_permissions=True)


def create_general_channel():
	return {"message": "ok"}
