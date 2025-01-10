# Copyright (c) 2024, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class RavenDocumentNotificationRecipients(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		channel_type: DF.Literal["Channel", "User"]
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		value: DF.Data
		variable_type: DF.Literal["Static", "DocField", "Jinja"]
	# end: auto-generated types

	pass
