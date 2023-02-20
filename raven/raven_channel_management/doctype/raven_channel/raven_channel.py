# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RavenChannel(Document):
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
    query = (frappe.qb.from_(channel)
             .select(channel.name, channel.channel_name, channel.type, channel.is_direct_message, channel.is_self_message)
             .join(channel_member)
             .on(channel.name == channel_member.channel_id)
             .where(channel_member.user_id == frappe.session.user))

    return query.run(as_dict=True)


@frappe.whitelist()
def get_direct_message_list():
    # get channel list where channel member is current user
    channel = frappe.qb.DocType("Raven Channel")
    channel_member = frappe.qb.DocType("Raven Channel Member")
    query = (frappe.qb.from_(channel)
             .select(channel.name, channel.channel_name, channel.type, channel.is_direct_message)
             .join(channel_member)
             .on(channel.name == channel_member.channel_id)
             .where(channel_member.user_id == frappe.session.user)
             .where(channel.is_direct_message == 1))
    direct_message_list = query.run(as_dict=True)
    # get the other user in the channel
    peers = frappe.db.get_list("Raven Channel Member", filters={
        "channel_id": ["in", [channel.name for channel in direct_message_list]],
        "user_id": ["!=", frappe.session.user]
    }, fields=["user_id", "channel_id"])
    for peer in peers:
        doc = frappe.get_doc('User', peer["user_id"])
        peer["full_name"] = doc.full_name
        peer["user_image"] = doc.user_image
        peer["first_name"] = doc.first_name
    return peers


def create_initial_direct_message_channels_for_all():
    # get all users
    user = frappe.qb.DocType("User")
    query = frappe.qb.from_(user).select(
        user.name).where(user.user_type == "System User")
    all_users = query.run(as_dict=True)

    # create direct message channels for each user with 5 other users
    for user in all_users:
        for index, user2 in enumerate(all_users):
            if index < 5:
                if user.name != user2.name:
                    dm_channel_between_users = frappe.db.count("Raven Channel", filters={
                        "is_direct_message": 1,
                        "channel_name": user.name + " _ " + user2.name or user2.name + " _ " + user.name
                    })
                    if dm_channel_between_users == 0:
                        channel = frappe.get_doc({
                            "doctype": "Raven Channel",
                            "channel_name": user.name + " _ " + user2.name,
                            "is_direct_message": 1
                        })
                        channel.insert()
                        channel.add_members([user.name, user2.name])
                else:
                    # create direct message channel with themselves
                    channel = frappe.get_doc({
                        "doctype": "Raven Channel",
                        "channel_name": user.name + " _ " + user2.name,
                        "is_direct_message": 1
                    })
                    channel.insert()
                    channel.add_members([user.name])
            else:
                break


def create_initial_direct_message_channels_for_user(doc, method):
    # get 5 users
    user = frappe.qb.DocType("User")
    query = frappe.qb.from_(user).select(user.name).where(
        user.user_type == "System User").where(user.name != doc.name).limit(4)
    users = query.run(as_dict=True)
    # create direct message channel with themselves
    channel = frappe.get_doc({
        "doctype": "Raven Channel",
        "channel_name": doc.name + " _ " + doc.name,
        "is_direct_message": 1
    })
    channel.insert()
    channel.add_members([doc.name])
    # create direct message channels with 4 other users
    for user in users:
        dm_channel_between_users = frappe.db.count("Raven Channel", filters={
            "is_direct_message": 1,
            "channel_name": doc.name + " _ " + user.name or user.name + " _ " + doc.name
        })
        if dm_channel_between_users == 0:
            channel = frappe.get_doc({
                "doctype": "Raven Channel",
                "channel_name": doc.name + " _ " + user.name,
                "is_direct_message": 1
            })
            channel.insert()
            channel.add_members([doc.name, user.name])
