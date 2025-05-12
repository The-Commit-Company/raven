# Copyright (c) 2024, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RavenReminder(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		remind_at: DF.Datetime
		description: DF.Text
		message_id: DF.Link | None
		user_id: DF.Link
		is_complete: DF.Check
		completed_at: DF.Datetime | None
	# end: auto-generated types

	@staticmethod
	def clear_old_logs(days=30):
		from frappe.query_builder import Interval
		from frappe.query_builder.functions import Now

		table = frappe.qb.DocType("Raven Reminder")
		frappe.db.delete(table, filters=(table.remind_at < (Now() - Interval(days=days))))
