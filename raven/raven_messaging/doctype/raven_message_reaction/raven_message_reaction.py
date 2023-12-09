# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.query_builder.functions import Count
import json
class RavenMessageReaction(Document):
    # begin: auto-generated types
    # This code is auto-generated. Do not modify anything in this block.

    from typing import TYPE_CHECKING

    if TYPE_CHECKING:
        from frappe.types import DF

        message: DF.Link
        reaction: DF.Data
        reaction_escaped: DF.Data | None
    # end: auto-generated types

    def before_save(self):
        """ Escape the reaction to UTF-8 (XXXX) """
        self.reaction_escaped = self.reaction.encode('unicode-escape').decode('utf-8').replace('\\u', '')
    
    def after_insert(self):
        #Update the count for the current reaction 
        calculate_message_reaction(self.message)
    
    def after_delete(self):
        # Update the count for the current reaction
        calculate_message_reaction(self.message)


def calculate_message_reaction(message_id):
	
    reactions = frappe.get_all('Raven Message Reaction',
        fields=['owner', 'reaction'],
        filters={
            'message': message_id
        },
        order_by='reaction_escaped'
    )

    total_reactions = {}

    for reaction_item in reactions:
        if reaction_item.reaction in total_reactions:
            existing_reaction = total_reactions[reaction_item.reaction]
            new_users = existing_reaction.get("users")
            new_users.append(reaction_item.owner)
            total_reactions[reaction_item.reaction] = {
                'count': existing_reaction.get('count') + 1,
                'users': new_users,
                'reaction': reaction_item.reaction
            }
            
        else:
            total_reactions[reaction_item.reaction] = {
                'count': 1,
                'users': [reaction_item.owner],
                'reaction': reaction_item.reaction
            }
    channel_id = frappe.db.get_value("Raven Message", message_id, "channel_id")
    frappe.db.set_value('Raven Message', message_id, 'message_reactions', json.dumps(total_reactions), update_modified=False)
    frappe.db.commit()
    frappe.publish_realtime('message_updated', {
            'channel_id': channel_id,
            'sender': frappe.session.user,
            'type': 'reaction',
            'message_id': message_id,
            },
             doctype='Raven Channel', 
            docname= channel_id,  # Adding this to automatically add the room for the event via Frappe
            after_commit=True)