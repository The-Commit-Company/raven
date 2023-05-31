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
	
    reactions = frappe.db.get_list('Raven Message Reaction',
        fields=['count(reaction_escaped) as count', 'reaction', 'reaction_escaped'],
        group_by='reaction_escaped',
        filters={
            'message': message_id
        }
    )

    total_reactions = {}

    if reactions:
        for reaction in reactions:
            total_reactions[reaction.reaction] = {
                'count': reaction.count,
                'users': get_users_for_each_reaction(message_id, reaction.reaction_escaped),
                'reaction': reaction.reaction
            }
	    
    message = frappe.get_doc('Raven Message', message_id)
    message.message_reactions = total_reactions
    message.save(ignore_permissions=True)
    frappe.db.commit()


def get_users_for_each_reaction(message_id, reaction=None):
	
    users = frappe.db.get_list('Raven Message Reaction',
        fields=['owner'],
        filters={
            'message': message_id,
            'reaction_escaped': reaction
        }
    )

    return [user.owner for user in users]