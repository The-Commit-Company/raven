# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt
import frappe
from frappe import _
from frappe.model.document import Document
from raven.api.raven_message import track_visit
from frappe.core.utils import html2text
import datetime


class RavenMessage(Document):
    # begin: auto-generated types
    # This code is auto-generated. Do not modify anything in this block.

    from typing import TYPE_CHECKING

    if TYPE_CHECKING:
        from frappe.types import DF
        from raven.raven_messaging.doctype.raven_mention.raven_mention import RavenMention

        channel_id: DF.Link
        content: DF.LongText | None
        file: DF.Attach | None
        file_thumbnail: DF.Attach | None
        image_height: DF.Data | None
        image_width: DF.Data | None
        is_edited: DF.Check
        is_reply: DF.Check
        json: DF.JSON | None
        link_doctype: DF.Link | None
        link_document: DF.DynamicLink | None
        linked_message: DF.Link | None
        mentions: DF.Table[RavenMention]
        message_reactions: DF.JSON | None
        message_type: DF.Literal["Text", "Image", "File"]
        replied_message_details: DF.JSON | None
        text: DF.LongText | None
        thumbnail_height: DF.Data | None
        thumbnail_width: DF.Data | None
    # end: auto-generated types

    def before_validate(self):
        try:
            if self.text:
                content = html2text(self.text)
                # Remove trailing new line characters and white spaces
                self.content = content.rstrip()
        except Exception:
            pass

        if not self.is_new():
            # this is not a new message, so it's a previous message being edited
            old_doc = self.get_doc_before_save()
            if old_doc.text != self.text:
                self.is_edited = True

        self.process_mentions()

    def validate(self):
        '''
        1. If there is a linked message, the linked message should be in the same channel
        '''
        self.validate_linked_message()

    def validate_linked_message(self):
        '''
        If there is a linked message, the linked message should be in the same channel
        '''
        if self.linked_message:
            if frappe.db.get_value("Raven Message", self.linked_message, "channel_id") != self.channel_id:
                frappe.throw(_("Linked message should be in the same channel"))

    def before_insert(self):
        '''
        If the message is a reply, update the replied_message_details field
        '''
        if self.is_reply and self.linked_message:
            details = frappe.db.get_value(
                "Raven Message", self.linked_message, ["text", "content", "file", "message_type", "owner", "creation"], as_dict=True)
            self.replied_message_details = {
                "text": details.text,
                "content": details.content,
                "file": details.file,
                "message_type": details.message_type,
                "owner": details.owner,
                "creation": datetime.datetime.strftime(details.creation, "%Y-%m-%d %H:%M:%S")
            }

    def after_insert(self):
        frappe.publish_realtime(
            'raven:unread_channel_count_updated', {
                'channel_id': self.channel_id,
                'play_sound': True,
                'sent_by': self.owner,
            })

    def process_mentions(self):
        if not self.json:
            return

        try:
            content = self.json.get('content', [{}])[0].get('content', [])
        except (IndexError, AttributeError):
            return

        entered_ids = set()
        for item in content:
            if item.get('type') == 'userMention':
                user_id = item.get('attrs', {}).get('id')
                if user_id and user_id not in entered_ids:
                    self.append('mentions', {'user': user_id})
                    entered_ids.add(user_id)

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
        # TODO: Remove this
        if frappe.get_cached_value('Raven Channel', self.channel_id, 'type') != 'Private' or frappe.db.exists("Raven Channel Member", {"channel_id": self.channel_id, "user_id": frappe.session.user}):
            track_visit(self.channel_id)


def on_doctype_update():
    '''
    Add indexes to Raven Message table
    '''
    # Index the selector (channel or message type) first for faster queries (less rows to sort in the next step)
    frappe.db.add_index("Raven Message", ["channel_id", "creation"])
    frappe.db.add_index("Raven Message", ["message_type", "creation"])
