# Copyright (c) 2024, The Commit Company and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class RavenOrganizationMember(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		manage_channels: DF.Check
		manage_chat: DF.Check
		organization: DF.Link
		role: DF.Link | None
		user: DF.Link
	# end: auto-generated types

	pass
