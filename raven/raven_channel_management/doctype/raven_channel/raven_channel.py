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
    query = (frappe.qb.from_(channel)
             .select(channel.name, channel.channel_name, channel.type, channel.is_direct_message)
             .join(channel_member)
             .on(channel.name == channel_member.channel_id)
             .where(channel_member.user_id == frappe.session.user))

    return query.run(as_dict=True)


def create_initial_direct_message_channels_for_all():
    # get all users
    user = frappe.qb.DocType("User")
    channel = frappe.qb.DocType("Raven Channel")
    query = frappe.qb.from_(user).select(
        user.name).where(user.user_type == "System User")
    all_users = query.run(as_dict=True)

    # create direct message channels for each user with 5 other users
    for user in all_users:
        for index, user2 in enumerate(all_users):
            if index < 5:
                dm_channel_between_users = frappe.db.count("Raven Channel", filters={
                    "is_direct_message": 1,
                    "channel_name": user.name + " _ " + user2.name
                })
                if dm_channel_between_users == 0:
                    if user.name != user2.name:
                        channel = frappe.get_doc({
                            "doctype": "Raven Channel",
                            "channel_name": user.name + " _ " + user2.name,
                            "is_direct_message": 1
                        })
                        channel.insert()
                        channel.add_members([user.name, user2.name])
            else:
                break


def create_initial_direct_message_channels_for_user(doc, method):
    user = frappe.qb.DocType("User")
    channel = frappe.qb.DocType("Raven Channel")
    query = frappe.qb.from_(user).select(user.name).where(user.user_type == "System User").where(
        user.name != doc.name).limit(5)
    users = query.run(as_dict=True)
    for user in users:
        dm_channel_between_users = frappe.db.count("Raven Channel", filters={
            "is_direct_message": 1,
            "channel_name": doc.name + " _ " + user.name
        })
        if dm_channel_between_users == 0:
            channel = frappe.get_doc({
                "doctype": "Raven Channel",
                "channel_name": doc.name + " _ " + user.name,
                "is_direct_message": 1
            })
            channel.insert()
            channel.add_members([doc.name, user.name])
