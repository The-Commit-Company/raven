# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class RavenMessageReaction(Document):
	pass

@frappe.whitelist(methods=['POST'])
def add_reaction(message_id, reaction, user_id):

	message = frappe.get_doc("Raven Message", message_id)

	message.append("message_reaction", {
		"reaction": reaction,
		"user": user_id
	})
	message.save()
