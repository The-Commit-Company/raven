# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt
import frappe
from frappe import _
from frappe.model.document import Document
from raven.api.raven_message import track_visit
from frappe.core.utils import html2text

class RavenMessage(Document):
    # begin: auto-generated types
    # This code is auto-generated. Do not modify anything in this block.

    from typing import TYPE_CHECKING

    if TYPE_CHECKING:
        from frappe.types import DF

        channel_id: DF.Link
        content: DF.LongText | None
        file: DF.Attach | None
        file_thumbnail: DF.Attach | None
        image_height: DF.Data | None
        image_width: DF.Data | None
        is_reply: DF.Check
        json: DF.JSON | None
        link_doctype: DF.Link | None
        link_document: DF.DynamicLink | None
        linked_message: DF.Link | None
        message_reactions: DF.JSON | None
        message_type: DF.Literal["Text", "Image", "File"]
        text: DF.LongText | None
        thumbnail_height: DF.Data | None
        thumbnail_width: DF.Data | None
    # end: auto-generated types

    def before_validate(self):
        try:
            if self.text:
                self.content = html2text(self.text)
        except Exception:
            pass
    def validate(self):
        '''
        1. Message can be created if the channel is open
        2. If the channel is private/public, the user creating the message should be a member of the channel
        3. If there is a linked message, the linked message should be in the same channel
        '''
        # self.validate_membership()
        self.validate_linked_message()

    def validate_membership(self):
        '''
            If the channel is private/public, the user creating the message should be a member of the channel
        '''
        channel_type = frappe.db.get_value(
            "Raven Channel", self.channel_id, "type")
        if channel_type != "Open":
            if not frappe.db.exists("Raven Channel Member", {"channel_id": self.channel_id, "user_id": self.owner}):
                frappe.throw(_("You are not a member of this channel"))

    def validate_linked_message(self):
        '''
        If there is a linked message, the linked message should be in the same channel
        '''
        if self.linked_message:
            if frappe.db.get_value("Raven Message", self.linked_message, "channel_id") != self.channel_id:
                frappe.throw(_("Linked message should be in the same channel"))

    def after_insert(self):
        frappe.publish_realtime(
            'raven:unread_channel_count_updated', {
                'channel_id': self.channel_id,
                'play_sound': True,
                'sent_by': self.owner,
            })

    def after_delete(self):
        self.send_update_event(type="delete")

    def on_update(self):
        self.send_update_event(type="update")

    def send_update_event(self, type):
        frappe.publish_realtime('message_updated', {
            'channel_id': self.channel_id,
            'sender': frappe.session.user,
            'message_id': self.name,
            'type': type,
        },
            doctype='Raven Channel',
            # Adding this to automatically add the room for the event via Frappe
            docname=self.channel_id,
            after_commit=True)
        frappe.db.commit()

    def on_trash(self):
        # delete all the reactions for the message
        frappe.db.delete("Raven Message Reaction", {"message": self.name})

    def before_save(self):
        if frappe.db.get_value('Raven Channel', self.channel_id, 'type') != 'Private' or frappe.db.exists("Raven Channel Member", {"channel_id": self.channel_id, "user_id": frappe.session.user}):
            track_visit(self.channel_id)


def on_doctype_update():
    '''
    Add indexes to Raven Message table
    '''
    # Index the selector (channel or message type) first for faster queries (less rows to sort in the next step)
    frappe.db.add_index("Raven Message", ["channel_id", "creation"])
    frappe.db.add_index("Raven Message", ["message_type", "creation"])
