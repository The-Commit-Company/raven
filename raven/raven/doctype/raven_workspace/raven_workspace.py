# Copyright (c) 2024, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class RavenWorkspace(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		can_only_join_via_invite: DF.Check
		logo: DF.AttachImage | None
		type: DF.Literal["Public", "Private"]
		workspace_name: DF.Data
	# end: auto-generated types

	pass
