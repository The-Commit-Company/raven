# Copyright (c) 2024, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class RavenThread(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF
		from raven.raven_messaging.doctype.raven_thread_participants.raven_thread_participants import RavenThreadParticipants

		channel_id: DF.Link
		participants: DF.Table[RavenThreadParticipants]
		thread_message: DF.Link
		title: DF.LongText
	# end: auto-generated types

	pass
