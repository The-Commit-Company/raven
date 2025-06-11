# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class RavenSlackImportUsers(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		email: DF.Data | None
		first_name: DF.Data | None
		import_type: DF.Literal["Map to Existing User", "Create New User"]
		is_bot: DF.Check
		last_name: DF.Data | None
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		raven_user: DF.Link | None
		slack_name: DF.Data | None
		slack_real_name: DF.Data | None
		slack_user_id: DF.Data
	# end: auto-generated types

	pass
