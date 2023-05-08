# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class RavenMessageReaction(Document):
	pass

@frappe.whitelist(methods=['POST'])
def add_reaction(message_id, reaction, user_id):

	message = frappe.get_doc("Raven Message", message_id)

	# if reaction with user_id already exists, then skip adding reaction
	for message_reaction in message.message_reaction:
		if message_reaction.user == user_id and message_reaction.reaction == reaction:
			return
	message.append("message_reaction", {
		"reaction": reaction,
		"user": user_id
	})
	message.save()

@frappe.whitelist(methods=['POST'])
def remove_reaction(message_id, reaction, user_id):

	message = frappe.get_doc("Raven Message", message_id)

	for message_reaction in message.message_reaction:
		if message_reaction.user == user_id and message_reaction.reaction == reaction:
			message.remove(message_reaction)
			message.save()
			return