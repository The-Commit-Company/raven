# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from raven.raven_notification_management.utils import send_notification_to_user
from raven.api.raven_message_reaction import calculate_message_reaction

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
        # frappe.enqueue_doc(self.doctype, self.name, 'send_notification')
        self.send_notification()
    
    def after_delete(self):
        # Update the count for the current reaction
        calculate_message_reaction(self.message)
    

    def send_notification(self):
        """Send a notification to the user that the message was reacted"""
        message_owner, content, channel_id = frappe.db.get_value('Raven Message', self.message, ['owner', 'content', 'channel_id'])

        trimmed_content = content[:50] + '...' if len(content) > 50 else content
        full_name, user_image = frappe.db.get_value('Raven User', {'user': self.owner}, ['full_name', 'user_image'])
        if message_owner != self.owner:
            send_notification_to_user(
                message_owner,
                'message_reaction',
                "{}  {} reacted".format(self.reaction, full_name),
                trimmed_content,
                {
                    'messageID': self.message,
                    'reaction': self.reaction,
                    'content': content,
                    'channel_id': channel_id,
                    'user_full_name': full_name,
                    'user_image': user_image,
                    'username': self.owner
                }
            )
