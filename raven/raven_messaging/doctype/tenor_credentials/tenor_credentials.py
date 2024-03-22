# Copyright (c) 2024, The Commit Company and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class TenorCredentials(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		client_key: DF.Data | None
		client_secret: DF.Data | None
	# end: auto-generated types
	pass
