# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document
from pypika import Order
from datetime import timedelta
from itertools import groupby
from datetime import datetime


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
    doc = frappe.get_doc({
        'doctype': 'Raven Message',
        'channel_id': channel_id,
        'text': text,
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


def get_messages(channel_id, start, limit):
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
             .orderby(raven_message.creation, order=Order.desc).limit(limit).offset(start))

    return query.run(as_dict=True)

def parse_messages(messages):
    # Sort the messages by creation date
    messages.sort(key=lambda x: x['creation'])

    # If two consecutive messages are from the same user
    # then the second message is a continuation of the first message
    # if sent within 2 minutes of the first message
    messages_with_continuation = []
    for i in range(len(messages)):
        message = messages[i]
        previous_message = messages[i - 1] if i > 0 else None
        is_continuation = (
            previous_message and
            message['owner'] == previous_message['owner'] and
            (message['creation'] - previous_message['creation']) < timedelta(minutes=2)
        )
        message['isContinuation'] = is_continuation
        messages_with_continuation.append(message)

    # Group the messages by date
    message_groups = {}
    for date, group in groupby(messages_with_continuation, key=lambda x: x['creation'].date()):
        message_groups[date.isoformat()] = list(group)

    return message_groups


@frappe.whitelist()
def get_messages_by_date(channel_id, start, limit):
    messages = get_messages(channel_id, start, limit)
    return parse_messages(messages)