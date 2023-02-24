# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RavenChannel(Document):

    def after_insert(self):
        # add current user as channel member
        frappe.get_doc({"doctype": "Raven Channel Member",
                       "channel_id": self.name, "user_id": frappe.session.user}).insert()

    def on_trash(self):
        # delete all members when channel is deleted
        frappe.db.delete("Raven Channel Member", {"channel_id": self.name})

    def before_insert(self):
        if self.is_direct_message == 1:
            self.type == "Private"

    def add_members(self, members):
        for member in members:
            channel_member = frappe.get_doc({
                "doctype": "Raven Channel Member",
                "channel_id": self.name,
                "user_id": member
            })
            channel_member.insert()


@frappe.whitelist()
def get_channel_list():
    # get channel list where channel member is current user
    channel = frappe.qb.DocType("Raven Channel")
    channel_member = frappe.qb.DocType("Raven Channel Member")
    private_query = (frappe.qb.from_(channel)
                     .select(channel.name, channel.channel_name, channel.type, channel.is_direct_message, channel.is_self_message)
                     .join(channel_member)
                     .on(channel.name == channel_member.channel_id)
                     .where(channel_member.user_id == frappe.session.user)
                     .where(channel.type == "Private"))
    public_query = (frappe.qb.from_(channel)
                    .select(channel.name, channel.channel_name, channel.type, channel.is_direct_message, channel.is_self_message)
                    .where(channel.type == "Public"))

    return private_query.run(as_dict=True) + public_query.run(as_dict=True)


@frappe.whitelist()
def create_direct_message_channel(user_id):
    # create direct message channel with user and current user
    channel = frappe.db.get_value("Raven Channel", filters={
        "is_direct_message": 1,
        "channel_name": frappe.session.user + " _ " + user_id
    }, fieldname="name")
    alt_channel = frappe.db.get_value("Raven Channel", filters={
        "is_direct_message": 1,
        "channel_name": user_id + " _ " + frappe.session.user
    }, fieldname="name")
    if channel:
        return channel
    elif alt_channel:
        return alt_channel
    else:
        if frappe.session.user == user_id:
            channel = frappe.get_doc({
                "doctype": "Raven Channel",
                "channel_name": frappe.session.user + " _ " + user_id,
                "is_direct_message": 1,
                "is_self_message": 1
            })
            channel.insert()
            channel.add_members([frappe.session.user])
            return channel.name
        else:
            channel = frappe.get_doc({
                "doctype": "Raven Channel",
                "channel_name": frappe.session.user + " _ " + user_id,
                "is_direct_message": 1
            })
            channel.insert()
            channel.add_members([frappe.session.user, user_id])
            return channel.name
