import frappe
from frappe.core.utils import html2text


def execute():
	update_old_messages_to_include_message_content()


def update_old_messages_to_include_message_content():
	"""
	Update all old messages to include message content
	Message content is required for search
	It is basically the message's text content but without any html tags
	(this is done to improve search results)
	This is a one-time operation, not required for new messages
	"""
	messages = frappe.db.get_all("Raven Message", fields=["name", "text", "message_type"])
	for message in messages:
		if message.text:
			cleaned_text = html2text(message.text)
			content = cleaned_text
			frappe.db.set_value("Raven Message", message.name, "content", content)
	frappe.db.commit()
