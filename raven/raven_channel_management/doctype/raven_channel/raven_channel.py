# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

all_users = [member['name'] for member in frappe.get_all(
    "User", filters={"user_type": "System User"}, fields=["name"])]

channel = frappe.qb.DocType("Raven Channel")
channel_member = frappe.qb.DocType("Raven Channel Member")
message = frappe.qb.DocType('Raven Message')
user = frappe.qb.DocType("User")


class RavenChannel(Document):
    # begin: auto-generated types
    # This code is auto-generated. Do not modify anything in this block.

    from typing import TYPE_CHECKING

    if TYPE_CHECKING:
        from frappe.types import DF

        channel_description: DF.Data | None
        channel_name: DF.Data
        is_archived: DF.Check
        is_direct_message: DF.Check
        is_self_message: DF.Check
        type: DF.Literal["Private", "Public", "Open"]
    # end: auto-generated types

    def on_trash(self):
        # Channel can only be deleted by the current channel admin
        if frappe.db.exists("Raven Channel Member", {"channel_id": self.name, "user_id": frappe.session.user, "is_admin": 1}):
            pass
        elif frappe.session.user == "Administrator":
            pass
        else:
            frappe.throw(
                _("You don't have permission to delete this channel."), frappe.PermissionError)
        
        # delete all members when channel is deleted
        frappe.db.delete("Raven Channel Member", {"channel_id": self.name})

        # delete all messages when channel is deleted
        frappe.db.delete("Raven Message", {"channel_id": self.name})

    def after_insert(self):
        # add current user as channel member
        if self.type == "Private" or self.type == "Public":
            frappe.get_doc({"doctype": "Raven Channel Member",
                            "channel_id": self.name, "user_id": frappe.session.user, "is_admin": 1}).insert()


    def validate(self):
        # If the user trying to modify the channel is not the owner or channel member, then don't allow
        old_doc = self.get_doc_before_save()

        if self.is_direct_message == 1:
            if old_doc:
                if old_doc.get('channel_name') != self.channel_name:
                    frappe.throw(
                        _("You cannot change the name of a direct message channel"), frappe.ValidationError)
        
        if old_doc and old_doc.get('is_archived') != self.is_archived:
            if frappe.db.exists("Raven Channel Member", {"channel_id": self.name, "user_id": frappe.session.user, "is_admin": 1}):
                pass
            elif frappe.session.user == "Administrator":
                pass
            else:
                frappe.throw(
                    _("You don't have permission to archive/unarchive this channel"), frappe.PermissionError)

        if self.type == "Private" or self.type == "Public":
            if self.owner == frappe.session.user and frappe.db.count("Raven Channel Member", {"channel_id": self.name}) <= 1:
                pass
            elif frappe.db.exists("Raven Channel Member", {"channel_id": self.name, "user_id": frappe.session.user}):
                pass
            elif frappe.session.user == "Administrator":
                pass
            else:
                frappe.throw(
                    _("You don't have permission to modify this channel"), frappe.PermissionError)

    def before_validate(self):
        if self.is_self_message == 1:
            self.is_direct_message = 1

        if self.is_direct_message == 1:
            self.type == "Private"
        if self.is_direct_message == 0:
            self.channel_name = self.channel_name.strip().lower().replace(" ", "-")

    def add_members(self, members, is_admin=0):
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
                    "user_id": member,
                    "is_admin": is_admin
                })
                channel_member.insert()

    def autoname(self):
        if self.is_direct_message == 0:
            self.name = self.channel_name.strip().lower().replace(" ", "-")


@frappe.whitelist()
def get_all_channels(hide_archived=False):
    '''
        Fetches all channels where current user is a member - both channels and DMs
        To be used on the web app. 
        On mobile app, these are separate lists
    '''

    # 1. Get "channels" - public, open, private, and DMs
    channels = get_channel_list(hide_archived)

    # 3. For every channel, we need to fetch the peer's User ID (if it's a DM)
    parsed_channels = []
    for channel in channels:
        parsed_channel = {
            **channel,
            "peer_user_id": get_peer_user_id(channel.get('name'), channel.get('is_direct_message'), channel.get('is_self_message')),
        }

        parsed_channels.append(parsed_channel)

    channel_list = [
        channel for channel in parsed_channels if not channel.get('is_direct_message')]
    dm_list = [channel for channel in parsed_channels if channel.get(
        'is_direct_message')]

    # Get extra users if dm channels length is less than 5
    extra_users = []
    number_of_dms = len(dm_list)

    if number_of_dms < 5:
        extra_users = get_extra_users(dm_list)

    return {
        "channels": channel_list,
        "dm_channels": dm_list,
        "extra_users": extra_users
    }


def get_channel_list(hide_archived=False):
    # get List of all channels where current user is a member (all includes public, private, open, and DM channels)
    query = (frappe.qb.from_(channel)
             .select(channel.name, channel.channel_name, channel.type, channel.channel_description, channel.is_archived, channel.is_direct_message, channel.is_self_message, channel.creation, channel.owner).distinct()
             .left_join(channel_member)
             .on((channel.name == channel_member.channel_id))
             .where((channel.type != "Private") | (channel_member.user_id == frappe.session.user)))

    if hide_archived:
        query = query.where(channel.is_archived == 0)

    return query.run(as_dict=True)


@frappe.whitelist()
def get_channels(hide_archived=False):
    channels = get_channel_list(hide_archived)
    for channel in channels:
        peer_user_id = get_peer_user_id(channel.get('name'), channel.get(
            'is_direct_message'), channel.get('is_self_message'))
        channel['peer_user_id'] = peer_user_id
        if peer_user_id:
            user_full_name = frappe.db.get_value(
                'User', peer_user_id, 'full_name')
            channel['full_name'] = user_full_name
    return channels

def get_peer_user_id(channel_id, is_direct_message, is_self_message=False):
    '''
    For a given channel, fetches the user id of the peer
    '''
    if is_direct_message == 0:
        return None
    if is_self_message:
        return frappe.session.user
    return frappe.db.get_value('Raven Channel Member', {
        'channel_id': channel_id,
        'user_id': ['!=', frappe.session.user]
    }, 'user_id')


def get_extra_users(dm_channels):
    '''
    Fetch extra users - only when number of DMs is less than 5.
    Do not repeat users already in the list
    '''
    existing_users = [dm_channel.get('peer_user_id')
                      for dm_channel in dm_channels]
    existing_users.append('Administrator')
    existing_users.append('Guest')
    return frappe.db.get_list('User', filters=[
        ['name', 'not in', existing_users],
        ['enabled', '=', 1],
        ['user_type', '=', 'System User'],
        ["Has Role", "role", "=", 'Raven User']], fields=['name', 'full_name', 'user_image'])


@frappe.whitelist(methods=['POST'])
def create_direct_message_channel(user_id):
    '''
        Creates a direct message channel between current user and the user with user_id
        The user_id can be the peer or the user themself
        1. Check if a channel already exists between the two users
        2. If not, create a new channel
        3. Check if the user_id is the current user and set is_self_message accordingly
    '''
    channel_name = frappe.db.get_value("Raven Channel", filters={
        "is_direct_message": 1,
        "channel_name": ["in", [frappe.session.user + " _ " + user_id, user_id + " _ " + frappe.session.user]]
    }, fieldname="name")
    if channel_name:
        return channel_name
    # create direct message channel with user and current user
    else:
        channel = frappe.get_doc({
            "doctype": "Raven Channel",
            "channel_name": frappe.session.user + " _ " + user_id,
            "is_direct_message": 1,
            "is_self_message": frappe.session.user == user_id
        })
        channel.insert()
        if frappe.session.user != user_id:
            channel.add_members([user_id], 1)
        return channel.name
