# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class RavenSettings(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from raven.raven_integrations.doctype.raven_hr_company_workspace.raven_hr_company_workspace import (
			RavenHRCompanyWorkspace,
		)

		auto_add_system_users: DF.Check
		auto_create_department_channel: DF.Check
		company_workspace_mapping: DF.Table[RavenHRCompanyWorkspace]
		department_channel_type: DF.Literal["Public", "Private"]
		enable_ai_integration: DF.Check
		oauth_client: DF.Link | None
		openai_api_key: DF.Password | None
		openai_organisation_id: DF.Data | None
		openai_project_id: DF.Data | None
		show_if_a_user_is_on_leave: DF.Check
		show_raven_on_desk: DF.Check
		tenor_api_key: DF.Data | None
	# end: auto-generated types

	def validate(self):
		if self.auto_create_department_channel:
			if not self.company_workspace_mapping:
				frappe.throw(_("Please map the companies to the workspace before enabling this feature."))

			for row in self.company_workspace_mapping:
				# Check if the company exists since it's a Data field
				if not frappe.db.exists("Company", row.company):
					frappe.throw(f"Company {row.company} does not exist.")
