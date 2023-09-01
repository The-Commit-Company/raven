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

    def after_insert(self):
        # add current user as channel member
        if self.type == "Private" or self.type == "Public":
            frappe.get_doc({"doctype": "Raven Channel Member",
                            "channel_id": self.name, "user_id": frappe.session.user, "is_admin": 1}).insert()

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
                    _("You don't have permission to modify this channel"), frappe.PermissionError)
        
        if self.is_direct_message == 1:
            old_doc = self.get_doc_before_save()
            if old_doc:
                if old_doc.get('channel_name') != self.channel_name:
                    frappe.throw(_("You cannot change the name of a direct message channel"), frappe.ValidationError)

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
def get_all_channels(hide_archived=True):
    '''
        Fetches all channels where current user is a member - both channels and DMs
        To be used on the web app. 
        On mobile app, these are separate lists
    '''

    # 1. Get "channels" - public, open, and private
    channels = get_channel_list(hide_archived)

    #2. Get "direct messages" - DMs
    dm_channels = get_dm_channels_for_user()

    #3. For every DM channel, we need to fetch user information
    parsed_dm_channels = []
    for dm_channel in dm_channels:
        parsed_dm_channel = {
            **dm_channel,
            **get_user_information(dm_channel.get('name'), dm_channel.get('is_self_message'))
        }

        parsed_dm_channels.append(parsed_dm_channel)

    # Get extra users if dm channels length is less than 5
    extra_users = []
    if len(parsed_dm_channels) < 5:
        extra_users = get_extra_users(parsed_dm_channels)
    return {
        "channels": channels,
        "dm_channels": parsed_dm_channels,
        "extra_users": extra_users
    }

@frappe.whitelist()
def get_channel_list(hide_archived=False):
    # get channel list where channel member is current user
    query = (frappe.qb.from_(channel)
             .select(channel.name, channel.channel_name, channel.type, channel.is_archived).distinct()
             .left_join(channel_member)
             .on((channel.name == channel_member.channel_id))
             .where((channel.type != "Private") | (channel_member.user_id == frappe.session.user))
             .where(channel.is_direct_message == 0))

    if hide_archived:
        query = query.where(channel.is_archived == 0)

    return query.run(as_dict=True)

def get_dm_channels_for_user():
    query = (frappe.qb.from_(channel)
             .select(channel.name, channel.is_self_message)
             .left_join(channel_member)
             .on((channel.name == channel_member.channel_id))
             .where(channel_member.user_id == frappe.session.user)
             .where(channel.is_direct_message == 1))

    return query.run(as_dict=True)

def get_user_information(channel_id, is_self_message=False):
    '''
    For a given channel, fetches the user information of the peer
    '''
    peer_user_id = get_peer_user_id(channel_id, is_self_message)
    if peer_user_id:
        full_name, user_image = frappe.db.get_value("User", peer_user_id, fieldname=["full_name", "user_image"])

        return {
            "user_id": peer_user_id,
            "full_name": full_name,
            "user_image": user_image
        }
    return {}


def get_peer_user_id(channel_id, is_self_message=False):
    '''
    For a given channel, fetches the user id of the peer
    '''
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
    existing_users = [dm_channel.get('user_id') for dm_channel in dm_channels]
    existing_users.append('Administrator')
    existing_users.append('Guest')
    return frappe.db.get_list('User', filters=[
        ['name', 'not in', existing_users],
        ['enabled', '=', 1],
        ['user_type', '=', 'System User'],
        ["Has Role", "role", "=", 'Raven User']]
        , fields=['name', 'full_name', 'user_image'])



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
            


@frappe.whitelist()
def get_raven_users_list():
    raven_users = []
    users = frappe.get_all("User", filters={"name": ["!=", "Administrator"]}, fields=[
                           "full_name", "user_image", "name", "first_name"], order_by="full_name")
    for user in users:
        if "Raven User" in frappe.get_roles(user.name):
            raven_users.append(user)
    return raven_users
