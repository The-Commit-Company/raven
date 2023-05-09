# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document
from pypika import JoinType, Order


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
        frappe.db.sql("DELETE FROM `tabRaven Message Reaction` WHERE message = %s", self.name)
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
def fetch_messages(channel_id):
    raven_message = frappe.qb.DocType('Raven Message')
    raven_message_reaction = frappe.qb.DocType('Raven Message Reaction')

    query = (frappe.qb.from_(raven_message)
             .join(raven_message_reaction, JoinType.left)
             .on(raven_message.name == raven_message_reaction.parent)
             .select(raven_message.name,
                     raven_message.channel_id,
                     raven_message.text,
                     raven_message.file,
                     raven_message.message_type,
                     raven_message.owner,
                     raven_message.creation)
             .groupby(raven_message.name)
             .where(raven_message.channel_id == channel_id)
             .orderby(raven_message.creation, order=Order.desc))

    return query.run(as_dict=True)