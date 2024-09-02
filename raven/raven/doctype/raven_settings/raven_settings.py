# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class RavenSettings(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		auto_add_system_users: DF.Check
		auto_create_department_channel: DF.Check
		department_channel_type: DF.Literal["Public", "Private"]
		enable_ai_integration: DF.Check
		openai_api_key: DF.Password | None
		openai_organisation_id: DF.Data | None
		openai_project_id: DF.Data | None
		oauth_client: DF.Link | None
		show_if_a_user_is_on_leave: DF.Check
		show_raven_on_desk: DF.Check
		tenor_api_key: DF.Data | None
	# end: auto-generated types

	pass
