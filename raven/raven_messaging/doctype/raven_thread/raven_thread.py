# Copyright (c) 2024, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RavenThread(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF
		from raven.raven_messaging.doctype.raven_thread_participant.raven_thread_participant import RavenThreadParticipant

		channel_id: DF.Link
		message_id: DF.Link
		participants: DF.Table[RavenThreadParticipant]
	# end: auto-generated types

	def before_insert(self):
		self.add_creator_as_participant()

	def add_creator_as_participant(self):
		self.append('participants', {
			'user': self.owner,
		})


	def after_insert(self):
		# Update the message from which the thread was created
		self.update_thread_message()

	def update_thread_message(self):
		# Update the thread_id in the message
		frappe.db.set_value('Raven Message', self.message_id, {
			'thread_id': self.name,
			'is_thread': 1
		})




