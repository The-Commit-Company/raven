import frappe


def execute():
	# Add rows to Raven Settings for the default workspace mapping for all companies
	raven_settings = frappe.get_doc("Raven Settings")

	if not raven_settings.auto_create_department_channel:
		return

	# Get all companies if they exist - check if ERPNext is installed
	if "erpnext" in frappe.get_installed_apps():
		companies = frappe.get_all("Company", pluck="name")

	for company in companies:
		raven_settings.append(
			"company_workspace_mapping", {"company": company, "raven_workspace": "Raven"}
		)

	raven_settings.save()
