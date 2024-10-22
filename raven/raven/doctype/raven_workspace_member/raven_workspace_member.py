# Copyright (c) 2024, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RavenWorkspaceMember(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		user: DF.Link
		workspace: DF.Link
	# end: auto-generated types

	pass


def on_doctype_update():
	"""
	Add indexes to Raven Workspace Member table
	"""
	# Index the selector first for faster queries (less rows to sort in the next step)
	frappe.db.add_index("Raven Workspace Member", ["workspace", "user"])
