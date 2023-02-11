# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Message(Document):
    pass


@frappe.whitelist(methods=['POST'])
def send_message(channel_id, text):
    doc = frappe.get_doc({
        'doctype': 'Message',
        'channel_id': channel_id,
        'text': text
    })
    doc.insert()
    frappe.publish_realtime('message_received', {
            'channel_id': channel_id
        })
    frappe.db.commit()
    return "message sent"