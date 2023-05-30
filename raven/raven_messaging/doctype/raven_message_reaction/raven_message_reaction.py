# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.query_builder.functions import Count

class RavenMessageReaction(Document):

	def before_save(self):
		""" Escape the reaction to UTF-8 (XXXX) """
		self.reaction_escaped = self.reaction.encode('unicode-escape').decode('utf-8').replace('\\u', '')

		# Check if the reaction already exists
		existing_reaction = frappe.db.exists({
			'doctype': 'Raven Message Reaction',
			'reaction_escaped': self.reaction_escaped,
			'message': self.message,
			'owner': self.owner
		})

		if existing_reaction:
			# Delete the existing reaction
			frappe.delete_doc('Raven Message Reaction', existing_reaction, ignore_permissions=True)
			frappe.db.commit()
			# Do not create a new reaction
			frappe.throw('Reaction already exists')

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

    result = (
        frappe.qb.from_(raven_message_reaction)
        .select(
            raven_message_reaction.reaction,
            raven_message_reaction.reaction_escaped,
            raven_message_reaction.owner,
            Count(raven_message_reaction.reaction_escaped).as_('count')
        )
        .where(raven_message_reaction.message == message_id)
        .groupby(raven_message_reaction.reaction_escaped)
    ).run(as_dict=True)

    total_reactions = {}

    if result:
        for row in result:
            reaction_escaped = row.reaction_escaped
            reaction = row.reaction
            owner = row.owner
            count = row.count

            if reaction_escaped not in total_reactions:
                total_reactions[reaction_escaped] = {'reaction': reaction, 'users': [], 'count': 0}

            total_reactions[reaction_escaped]['users'].append(owner)
            total_reactions[reaction_escaped]['count'] += count

    # Save the reaction data in the message
    message.message_reactions = total_reactions
    message.save(ignore_permissions=True)
    frappe.db.commit()