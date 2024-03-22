# Copyright (c) 2024, The Commit Company and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class RavenPoll(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.model.document import Document
		from frappe.types import DF

		is_anonymous: DF.Check
		is_multi_choice: DF.Check
		options: DF.Table[Document]
		question: DF.SmallText
	# end: auto-generated types

	pass
