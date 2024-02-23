# Copyright (c) 2024, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe import scrub
from frappe.modules.export_file import export_to_files
from frappe.model.document import Document
from raven.api.raven_channel_member import remove_channel_member


class RavenBot(Document):
    def on_update(self):
        if frappe.conf.developer_mode and self.is_standard:
            export_to_files(
                record_list=[["Raven Bot", self.name]], record_module=self.module
            )

    def check_membership(self, channel_id):
        raven_user = frappe.get_value(
            "Raven User", {"bot": self.name}, ["name"])
        if not raven_user:
            frappe.throw("Raven User not found for this Raven Bot")
        member_id = frappe.db.exists("Raven Channel Member", {
                                     "channel_id": channel_id, "user_id": raven_user})
        if member_id:
            return True
        return False

    def add_to_channel(self, channel_id):
        raven_user = frappe.get_value(
            "Raven User", {"bot": self.name}, ["name"])
        if not raven_user:
            frappe.throw("Raven User not found for this Raven Bot")

        if not self.check_membership(channel_id):
            raven_channel_member = frappe.get_doc(
                doctype="Raven Channel Member",
                user_id=raven_user,
                channel_id=channel_id
            )
            raven_channel_member.insert()
            frappe.db.commit()

    def remove_from_channel(self, channel_id):
        raven_user = frappe.get_value(
            "Raven User", {"bot": self.name}, ["name"])
        if not raven_user:
            frappe.throw("Raven User not found for this Raven Bot")

        if self.check_membership(channel_id):
            remove_channel_member(raven_user, channel_id)

    # message is a dictionary

    def send_message(self, channel_id, message):
        raven_user = frappe.get_value(
            "Raven User", {"bot": self.name}, ["name"])
        if not raven_user:
            frappe.throw("Raven User not found for this Raven Bot")
        raven_channel = frappe.get_doc("Raven Channel", channel_id)
        if not raven_channel:
            frappe.throw("Raven Channel not found")
        if message.get('is_reply', False):
            doc = frappe.get_doc({
                'owner': raven_user,
                'doctype': 'Raven Message',
                'channel_id': channel_id,
                'text': message.get('text', ''),
                'message_type': 'Text',
                'is_reply': message.get('is_reply', 0),
                'linked_message': message.get('linked_message', None),
                'json': message.get('json', None),
                'is_bot_message': 1,
                'bot': self.name
            })
        else:
            doc = frappe.get_doc({
                'owner': raven_user,
                'doctype': 'Raven Message',
                'channel_id': channel_id,
                'text': message.get('text', ''),
                'message_type': 'Text',
                'json': message.get('json', None),
                'is_bot_message': 1,
                'bot': self.name
            })
        doc.insert()
        return "message sent"

    def send_direct_message(self, user_id, message):
        raven_user = frappe.get_value(
            "Raven User", {"bot": self.name}, ["name"])
        if not raven_user:
            frappe.throw("Raven User not found for this Raven Bot")

        channel_name = self.get_dm_channel_id(user_id)
        if channel_name:
            channel_id = channel_name
        else:
            channel = frappe.get_doc({
                "doctype": "Raven Channel",
                "channel_name": raven_user + " _ " + user_id,
                "is_direct_message": 1,
            })
            channel.insert()
            channel.add_members([user_id, raven_user], 1)
            channel_id = channel.name
        if message.get('is_reply', False):
            doc = frappe.get_doc({
                'owner': raven_user,
                'doctype': 'Raven Message',
                'channel_id': channel_id,
                'text': message.get('text', ''),
                'message_type': 'Text',
                'is_reply': message.get('is_reply', 0),
                'linked_message': message.get('linked_message', None),
                'json': message.get('json', None),
                'is_bot_message': 1,
                'bot': self.name
            })
        else:
            doc = frappe.get_doc({
                'owner': raven_user,
                'doctype': 'Raven Message',
                'channel_id': channel_id,
                'text': message.get('text', ''),
                'message_type': 'Text',
                'json': message.get('json', None),
                'is_bot_message': 1,
                'bot': self.name
            })
        doc.insert()
        return "message sent"

    def get_dm_channel_id(self, user_id):
        raven_user = frappe.get_value(
            "Raven User", {"bot": self.name}, ["name"])
        if not raven_user:
            frappe.throw("Raven User not found for this Raven Bot")

        channel_name = frappe.db.get_value("Raven Channel", filters={
            "is_direct_message": 1,
            "channel_name": ["in", [raven_user + " _ " + user_id, user_id + " _ " + raven_user]]
        }, fieldname="name")
        if channel_name:
            return channel_name
        return None

    def get_last_message(self, channel_id=None, message_type=None, link_document=None, date=None):
        filters = {"bot": self.name}
        if channel_id is not None:
            filters["channel_id"] = channel_id
        if message_type is not None:
            filters["message_type"] = message_type
        if link_document is not None:
            filters["link_document"] = link_document
        if date is not None:
            filters["creation"] = [">", date]

        return frappe.get_last_doc("Raven Message", filters=filters, order_by="creation desc")

    def get_previous_messages(self, channel_id=None, message_type=None, link_document=None, date=None):
        filters = {"bot": self.name}
        if channel_id is not None:
            filters["channel_id"] = channel_id
        if message_type is not None:
            filters["message_type"] = message_type
        if link_document is not None:
            filters["link_document"] = link_document
        if date is not None:
            filters["creation"] = [">", date]

        return frappe.get_all("Raven Message", filters=filters, order_by="creation desc", pluck='name')

    def get_bot_dotted_path(self):
        return (frappe.local.module_app[scrub(self.module)] + "." + scrub(self.module) + ".raven_bot." + scrub(self.name) + "." + scrub(self.name))

    def on_mention(self):
        method_path = self.get_bot_dotted_path() + ".on_mention"
        method = frappe.get_attr(method_path)
        if method:
            method()
        else:
            print("Method not found")
