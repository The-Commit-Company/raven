# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ChatConversation(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF
		from raven.chatbot.doctype.chatmessage.chatmessage import ChatMessage

		created_on: DF.Datetime | None
		messages: DF.Table[ChatMessage]
		title: DF.Data | None
		user: DF.Link | None
	# end: auto-generated types

	def after_save(self):
		# Gửi sự kiện realtime khi tên được cập nhật
		frappe.publish_realtime(
			'raven:update_conversation_title',
			{
				'conversation_id': self.name,
				'new_title': self.title,
				'creation': self.created_on
			}
		)
