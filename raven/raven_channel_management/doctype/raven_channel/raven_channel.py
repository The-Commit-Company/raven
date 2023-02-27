# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

all_users = [member['name'] for member in frappe.get_all(
    "User", filters={"user_type": "System User"}, fields=["name"])]


class RavenChannel(Document):

    def after_insert(self):
        # add current user as channel member
        frappe.get_doc({"doctype": "Raven Channel Member",
                       "channel_id": self.name, "user_id": frappe.session.user}).insert()
        
        # TODO: This should be removed since it's not needed (#57)
        if self.type == "Open":
            self.add_members(all_users)

    def on_trash(self):
        # delete all members when channel is deleted
        frappe.db.delete("Raven Channel Member", {"channel_id": self.name})

        # delete all messages when channel is deleted
        frappe.db.delete("Raven Message", {"channel_id": self.name})
    
    def validate(self):
        # If the user trying to modify the channel is not the owner or channel member, then don't allow
        if self.type == "Private" or self.type == "Public":
            if self.owner == frappe.session.user:
                pass
            elif frappe.db.exists("Raven Channel Member", {"channel_id": self.name, "user_id": frappe.session.user}):
                pass
            else:
                frappe.throw("You don't have permission to modify this channel", frappe.PermissionError)


    def before_validate(self):
        if self.is_direct_message == 1:
            self.type == "Private"

    def add_members(self, members):
        for member in members:
            doc = frappe.db.get_value("Raven Channel Member", filters={
                "channel_id": self.name,
                "user_id": member
            }, fieldname="name")
            if doc:
                continue
            else:
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
    open_query = (frappe.qb.from_(channel)
                  .select(channel.name, channel.channel_name, channel.type, channel.is_direct_message, channel.is_self_message)
                  .where(channel.type == "Open"))

    return private_query.run(as_dict=True) + public_query.run(as_dict=True) + open_query.run(as_dict=True)


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


def create_general_channel(doc, method):
    # create general channel and add all users as members
    channel = frappe.db.get_value("Raven Channel", filters={
        "is_direct_message": 0,
        "channel_name": "general",
        "type": "Open"
    }, fieldname="name")
    if channel:
        channel = frappe.get_doc("Raven Channel", channel)
    else:
        channel = frappe.get_doc({
            "doctype": "Raven Channel",
            "channel_name": "general",
            "is_direct_message": 0,
            "type": "Open"
        })
        channel.insert()
    channel.add_members(all_users)


def add_user_to_open_channel(doc, method):
    # add new user to all open channels
    if doc.user_type == "System User":
        open_channels = frappe.get_all("Raven Channel", filters={
            "type": "Open"
        }, fields=["name"])
        for channel in open_channels:
            frappe.get_doc({
                "doctype": "Raven Channel Member",
                "channel_id": channel.name,
                "user_id": doc.name
            }).insert()
