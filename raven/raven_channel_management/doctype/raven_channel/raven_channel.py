# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from raven.raven_messaging.doctype.raven_message.raven_message import get_unread_count_for_channels, get_unread_count_for_direct_message_channels

all_users = [member['name'] for member in frappe.get_all(
    "User", filters={"user_type": "System User"}, fields=["name"])]

channel = frappe.qb.DocType("Raven Channel")
channel_member = frappe.qb.DocType("Raven Channel Member")
message = frappe.qb.DocType('Raven Message')
user = frappe.qb.DocType("User")


class RavenChannel(Document):

    def after_insert(self):
        # add current user as channel member
        if self.type == "Private" or self.type == "Public":
            frappe.get_doc({"doctype": "Raven Channel Member",
                            "channel_id": self.name, "user_id": frappe.session.user}).insert()

    def on_trash(self):
        # delete all members when channel is deleted
        frappe.db.delete("Raven Channel Member", {"channel_id": self.name})

        # delete all messages when channel is deleted
        frappe.db.delete("Raven Message", {"channel_id": self.name})

    def validate(self):
        # If the user trying to modify the channel is not the owner or channel member, then don't allow
        if self.type == "Private" or self.type == "Public":
            if self.owner == frappe.session.user and frappe.db.count("Raven Channel Member", {"channel_id": self.name}) <= 1:
                pass
            elif frappe.db.exists("Raven Channel Member", {"channel_id": self.name, "user_id": frappe.session.user}):
                pass
            elif frappe.session.user == "Administrator":
                pass
            else:
                frappe.throw(
                    "You don't have permission to modify this channel", frappe.PermissionError)

    def on_update(self):
        frappe.publish_realtime('channel_updated', {
            'channel_id': self.name}, after_commit=True)
        frappe.publish_realtime('channel_list_updated', {
            'channel_id': self.name}, after_commit=True)
        frappe.db.commit()

    def after_delete(self):
        frappe.publish_realtime('channel_deleted', {
            'channel_id': self.name}, after_commit=True)
        frappe.publish_realtime('channel_list_updated', {
            'channel_id': self.name}, after_commit=True)
        frappe.db.commit()

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

    def autoname(self):
        if self.is_direct_message == 0:
            self.name = self.channel_name.lower().replace(" ", "-")


@frappe.whitelist()
def get_channel_list(hide_archived=False):
    # get channel list where channel member is current user
    query = (frappe.qb.from_(channel)
             .select(channel.name, channel.channel_name, channel.type, channel.is_direct_message, channel.is_self_message, channel.is_archived).distinct()
             .left_join(channel_member)
             .on((channel.name == channel_member.channel_id))
             .where((channel.type != "Private") | (channel_member.user_id == frappe.session.user))
             .where(channel.is_direct_message == 0))

    if hide_archived:
        query = query.where(channel.is_archived == 0)

    frappe.publish_realtime('unread_channel_count_updated', {
        'unread_count': get_unread_count_for_channels()}, after_commit=True)
    frappe.db.commit()

    return query.run(as_dict=True)


@frappe.whitelist(methods=['POST'])
def create_direct_message_channel(user_id):
    channel_name = frappe.db.get_value("Raven Channel", filters={
        "is_direct_message": 1,
        "channel_name": ["in", [frappe.session.user + " _ " + user_id, user_id + " _ " + frappe.session.user]]
    }, fieldname="name")
    if channel_name:
        return channel_name
    # create direct message channel with user and current user
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


@frappe.whitelist()
def create_channel(channel_name, type, channel_description=None):
    # create channel with channel name and channel type if it doesn't exist else return error
    channel_name = channel_name.lower()
    channel = frappe.db.exists("Raven Channel", {"channel_name": channel_name})
    if channel:
        frappe.throw("Channel name already exists", frappe.DuplicateEntryError)
    else:
        channel = frappe.get_doc({
            "doctype": "Raven Channel",
            "channel_name": channel_name,
            "type": type,
            "channel_description": channel_description
        })
        channel.insert()
        first_member = frappe.db.get_value(
            "Raven Channel Member", {'channel_id': channel.name}, 'name')
        frappe.db.set_value("Raven Channel Member",
                            first_member, "is_admin", 1)
        return channel.name


@frappe.whitelist()
# TODO: enqueue this function
def delete_channel(channel_id):
    channel = frappe.get_doc("Raven Channel", channel_id)
    # delete all messages in the channel
    frappe.db.delete("Raven Message", {"channel_id": channel_id})
    # delete all channel members
    frappe.db.delete("Raven Channel Member", {"channel_id": channel_id})
    # delete channel
    channel.delete()


@frappe.whitelist()
def get_direct_message_channels_list():
    # get all direct message channels of user
    query = (
        frappe.qb
        .from_(channel)
        .join(channel_member).on(channel.name == channel_member.channel_id)
        .join(user).on(channel_member.user_id == user.name)
        .where((channel_member.user_id != frappe.session.user) | (channel.is_self_message == 1)).distinct()
        .where(channel.is_direct_message == 1)
        .where(channel.channel_name.like(f"%{frappe.session.user}%"))
        .select(channel.name, channel.channel_name, user.full_name, (user.name).as_('user_id')))

    frappe.publish_realtime('unread_dm_count_updated', {
        'unread_count': get_unread_count_for_direct_message_channels()}, after_commit=True)
    frappe.db.commit()

    return query.run(as_dict=True)
