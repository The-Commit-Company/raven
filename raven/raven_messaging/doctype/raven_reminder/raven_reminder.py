# Copyright (c) 2024, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils.data import now_datetime


class RavenReminder(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		completed_at: DF.Datetime | None
		description: DF.Data | None
		is_complete: DF.Check
		message_id: DF.Link | None
		remind_at: DF.Datetime
		user_id: DF.Link
	# end: auto-generated types

	@staticmethod
	def clear_old_logs(days=30):
		from frappe.query_builder import Interval
		from frappe.query_builder.functions import Now

		table = frappe.qb.DocType("Raven Reminder")
		frappe.db.delete(table, filters=(table.remind_at < (Now() - Interval(days=days))))


def send_reminders():
	"""
	TODO: CRON Job to send new reminders to users every 15 minutes
	"""
	reminders = frappe.get_all(
		"Raven Reminder",
		filters=[
			("user_id", "=", frappe.session.user),
			("remind_at", "<=", now_datetime()),
			("is_complete", "=", 0),
		],
	)

	if len(reminders) == 0:
		return

	frappe.publish_realtime("due_reminders", {"message": reminders}, room="all", after_commit=True)
