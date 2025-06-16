# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ChatMessage(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		is_user: DF.Check
		message: DF.TextEditor | None
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		sender: DF.Data | None
		timestamp: DF.Datetime | None
		message_type: DF.Literal["Text", "Image", "File", "Poll", "System"]
		file: DF.Attach | None
	# end: auto-generated types

	def after_insert(self):
		# Gửi sự kiện realtime khi có tin nhắn mới
		frappe.publish_realtime(
			'new_message',
			{
				'conversation_id': self.parent,
				'message': self.message,
				'is_user': self.is_user
			}
		)

		# Gửi sự kiện riêng cho tin nhắn AI
		if not self.is_user:
			frappe.publish_realtime(
				'raven:new_ai_message',
				{
					'conversation_id': self.parent,
					'message': self.message
				}
			)
