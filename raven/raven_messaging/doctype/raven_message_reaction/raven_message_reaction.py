# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.query_builder.functions import Count

class RavenMessageReaction(Document):

	def after_insert(self):
		# Update the count for the current reaction
		calculate_message_reaction(self.message)
	
	def after_delete(self):
		# Update the count for the current reaction
		calculate_message_reaction(self.message)


def calculate_message_reaction(message_id):
	'''
		Calculates the total number of reactions for a message
	'''
	message = frappe.get_doc('Raven Message', message_id)
	raven_message_reaction = frappe.qb.DocType('Raven Message Reaction')

	query = (
    	frappe.qb.from_(raven_message_reaction)
        	.select(raven_message_reaction.reaction, Count(raven_message_reaction.reaction).as_("count"))
			.groupby(raven_message_reaction.reaction)
			.where(raven_message_reaction.message == message_id)
	)

	result = query.run(as_dict=True)

	total_reactions = {}
	
	if result:
		for row in result:
			total_reactions[row.reaction] = row.count

	message.message_reactions = total_reactions
	message.save(ignore_permissions=True)
	frappe.db.commit()