import datetime
import json

import frappe


def execute():
	"""
	Update all old messages to include it's replied message content
	This is a one-time operation, not required for new messages
	"""
	messages = frappe.db.get_all(
		"Raven Message", fields=["name", "linked_message"], filters={"is_reply": 1}
	)
	for message in messages:
		if message.linked_message:
			details = frappe.db.get_value(
				"Raven Message",
				message.linked_message,
				["text", "content", "file", "message_type", "owner", "creation"],
				as_dict=True,
			)
			frappe.db.set_value(
				"Raven Message",
				message.name,
				"replied_message_details",
				json.dumps(
					{
						"text": details.text,
						"content": details.content,
						"file": details.file,
						"message_type": details.message_type,
						"owner": details.owner,
						"creation": datetime.datetime.strftime(details.creation, "%Y-%m-%d %H:%M:%S"),
					},
					indent=1,
				),
				update_modified=False,
			)
	frappe.db.commit()
