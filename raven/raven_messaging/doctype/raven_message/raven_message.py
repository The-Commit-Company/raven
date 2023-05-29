# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document
from pypika import Order
from datetime import timedelta


class RavenMessage(Document):

    def after_delete(self):
        frappe.publish_realtime('message_deleted', {
            'channel_id': self.channel_id}, after_commit=True)
        frappe.db.commit()

    def on_update(self):
        frappe.publish_realtime('message_updated', {
            'channel_id': self.channel_id}, after_commit=True)
        frappe.db.commit()

    def on_trash(self):
        # delete all the reactions for the message
        frappe.db.sql(
            "DELETE FROM `tabRaven Message Reaction` WHERE message = %s", self.name)
        frappe.db.commit()


@frappe.whitelist(methods=['POST'])
def send_message(channel_id, text):

    # remove empty paragraphs
    clean_text = text.replace('<p><br></p>', '').strip()
    # remove empty list items
    clean_text = clean_text.replace('<li><br></li>', '').strip()

    if clean_text:
        doc = frappe.get_doc({
            'doctype': 'Raven Message',
            'channel_id': channel_id,
            'text': clean_text,
            'message_type': 'Text'
        })
        doc.insert()
        frappe.publish_realtime('message_received', {
                                'channel_id': channel_id}, after_commit=True)
        frappe.db.commit()
        return "message sent"


@frappe.whitelist()
def fetch_recent_files(channel_id):
    raven_message = frappe.qb.DocType('Raven Message')

    query = (frappe.qb.from_(raven_message)
             .select(raven_message.name, raven_message.file, raven_message.owner, raven_message.creation, raven_message.message_type)
             .where(raven_message.channel_id == channel_id)
             .where((raven_message.message_type == 'Image') | (raven_message.message_type == 'File'))
             .orderby(raven_message.creation, order=Order.desc).limit(10))

    return query.run(as_dict=True)


@frappe.whitelist()
def get_last_channel():
    query = frappe.get_all(
        'Raven Message',
        filters={'owner': frappe.session.user},
        fields=['channel_id'],
        order_by='creation DESC',
        limit_page_length=1
    )

    if query:
        return query[0]['channel_id']
    else:
        return 'general'


def get_messages(channel_id):
    raven_message = frappe.qb.DocType('Raven Message')

    query = (frappe.qb.from_(raven_message)
             .select(raven_message.name,
                     raven_message.owner,
                     raven_message.creation,
                     raven_message.text,
                     raven_message.file,
                     raven_message.message_type,
                     raven_message.message_reactions)
             .where(raven_message.channel_id == channel_id)
             .orderby(raven_message.creation, order=Order.asc))

    return query.run(as_dict=True)


def parse_messages(messages):

    messages_with_date_header = []
    previous_message = None 

    for i in range(len(messages)):
        message = messages[i]
        is_continuation = (
            previous_message and
            message['owner'] == previous_message['owner'] and
            (message['creation'] - previous_message['creation']) < timedelta(minutes=2)
        )
        message['is_continuation'] = int(bool(is_continuation))

        if i == 0 or message['creation'].date() != previous_message['creation'].date():
            messages_with_date_header.append({
                'block_type': 'date',
                'data': message['creation'].date()
            })

        messages_with_date_header.append({
            'block_type': 'message',
            'data': message
        })

        previous_message = message 

    return messages_with_date_header


@frappe.whitelist()
def get_messages_with_dates(channel_id):
    messages = get_messages(channel_id)
    return parse_messages(messages)