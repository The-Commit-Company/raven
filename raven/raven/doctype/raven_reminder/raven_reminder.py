# Copyright (c) 2026, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils.data import get_datetime, now_datetime

from raven.utils import get_raven_user


class RavenReminder(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		channel_id: DF.Link | None
		description: DF.SmallText | None
		is_read: DF.Check
		message: DF.Link
		remind_at: DF.Datetime
		status: DF.Literal["Scheduled", "Sent"]
		user: DF.Link
	# end: auto-generated types

	def validate(self):
		self.user = get_raven_user(frappe.session.user)

		if get_datetime(self.remind_at) < now_datetime():
			frappe.throw(_("Reminder cannot be set in the past."))

		if self.message and not self.channel_id:
			self.channel_id = frappe.db.get_value("Raven Message", self.message, "channel_id")
			if not self.channel_id:
				frappe.throw(_("The reminder's message does not belong to any channel."))


def on_doctype_update():
	"""Composite index for the every-minute due sweep (status + remind_at)."""
	frappe.db.add_index("Raven Reminder", ["status", "remind_at"])
