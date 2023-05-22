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


def get_messages(channel_id, start_after, limit):
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
             .orderby(raven_message.creation, order=Order.desc).limit(limit).offset(start_after))

    return query.run(as_dict=True)

def parse_messages(messages):
    message_list = []
    message_group = {
        'block_type': 'message_group',
        'data': []
    }
    last_message = None
    for message in messages:
        # if message is from the same user,
        # then the second message is a continuation of the first message
        # if sent within 2 minutes of the first message
        if last_message and message_group['data'] != []:
            if (
                message['owner'] == last_message['owner']
                and (last_message['creation'] - message['creation']) < timedelta(minutes=2)
            ):
                message_group['data'].append(message)
            elif message['creation'].date() != last_message['creation'].date():
                if len(message_group['data']) > 1:
                    message_group['block_type'] = 'message_group'
                else:
                    message_group['block_type'] = 'message'
                message_list.append(message_group)
                message_list.append(
                    {'block_type': 'date', 'data': [last_message['creation'].date()]})
                message_group = {
                    'block_type': 'message_group', 'data': [message]}
            else:
                if len(message_group['data']) > 1:
                    message_group['block_type'] = 'message_group'
                else:
                    message_group['block_type'] = 'message'
                message_list.append(message_group)
                message_group = {
                    'block_type': 'message_group', 'data': [message]}
        else:
            message_group = {'block_type': 'message_group', 'data': [message]}
        last_message = message
    return message_list

@frappe.whitelist()
def get_messages_by_date(channel_id, start_after, limit):
    messages = get_messages(channel_id, start_after, limit)
    return parse_messages(messages)