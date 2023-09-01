# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from pypika import JoinType, Order


class RavenChannelMember(Document):

    def before_validate(self):
        self.last_visit = frappe.utils.now()
    def validate(self):
        if not self.check_if_user_is_member():
            frappe.throw(
                "You don't have permission to add/modify members in this channel", frappe.PermissionError)

    def before_insert(self):
        # 1. A user cannot be a member of a channel more than once
        if frappe.db.exists("Raven Channel Member", {"channel_id": self.channel_id, "user_id": self.user_id}):
            frappe.throw("You are already a member of this channel",
                         frappe.DuplicateEntryError)
        # if there are no members in the channel, then the member becomes admin
        if frappe.db.count("Raven Channel Member", {"channel_id": self.channel_id}) == 0:
            self.is_admin = 1

    def after_delete(self):
        if frappe.db.count("Raven Channel Member", {"channel_id": self.channel_id}) == 0 and frappe.db.get_value("Raven Channel", self.channel_id, "type") == "Private":
            frappe.db.set_value("Raven Channel", self.channel_id,
                                "is_archived", 1)
        if self.get_admin_count() == 0 and frappe.db.count("Raven Channel Member", {"channel_id": self.channel_id}) > 0:
            first_member = frappe.db.get_value("Raven Channel Member", {
                                               "channel_id": self.channel_id}, ["name"], as_dict=1, order_by="creation")
            frappe.db.set_value("Raven Channel Member",
                                first_member.name, "is_admin", 1)

    def on_trash(self):
        # if the leaving member is admin, then the first member becomes new admin
        if self.is_admin == 1 and frappe.db.count("Raven Channel Member", {"channel_id": self.channel_id}) > 0:
            first_member = frappe.db.get_value("Raven Channel Member", {
                                               "channel_id": self.channel_id}, ["name"], as_dict=1, order_by="creation")
            frappe.db.set_value("Raven Channel Member",
                                first_member.name, "is_admin", 1)
        if not self.check_if_user_is_member():
            frappe.throw(
                "You don't have permission to remove members from this channel", frappe.PermissionError)
        frappe.db.commit()

    def check_if_user_is_member(self):
        is_member = True
        channel = frappe.db.get_value("Raven Channel", self.channel_id, [
                                      "type", "owner"], as_dict=True)
        if channel.type == "Private":
            # A user can only add members to a private channel if they are themselves member of the channel or if they are the owner of a new channel
            if channel.owner == frappe.session.user and frappe.db.count("Raven Channel Member", {"channel_id": self.channel_id}) == 0:
                # User is the owner of a channel and there are no members in the channel
                pass
            elif frappe.db.exists("Raven Channel Member", {"channel_id": self.channel_id, "user_id": frappe.session.user}):
                # User is a member of the channel
                pass
            elif frappe.session.user == "Administrator":
                # User is Administrator
                pass
            else:
                is_member = False
        return is_member

    def get_admin_count(self):
        return frappe.db.count("Raven Channel Member", {"channel_id": self.channel_id, "is_admin": 1})


@frappe.whitelist()
def get_channel_members_and_data(channel_id):
    # fetch all channel members
    # get member details from user table, such as name, full_name, user_image, first_name
    if frappe.db.exists("Raven Channel", channel_id):
        channel_member = frappe.qb.DocType('Raven Channel Member')
        channel_data = frappe.qb.DocType('Raven Channel')
        user = frappe.qb.DocType('User')
        if frappe.db.get_value("Raven Channel", channel_id, "type") == "Open":
            member_query = (frappe.qb.from_(user)
                            .select(user.name, user.full_name, user.user_image, user.first_name)
                            .where(user.name != "administrator")
                            .where(user.name != "guest"))
        else:
            member_query = (frappe.qb.from_(channel_member)
                            .join(user, JoinType.left)
                            .on(channel_member.user_id == user.name)
                            .select(user.name, user.full_name, user.user_image, user.first_name, channel_member.is_admin)
                            .where(channel_member.channel_id == channel_id)
                            .where(channel_member.user_id != "administrator")
                            .orderby(channel_member.creation, order=Order.desc))

        channel_data = frappe.db.get_value("Raven Channel", channel_id, [
                                        "name", "channel_name", "type", "creation", "owner", "channel_description", "is_direct_message", "is_self_message", "is_archived"], as_dict=True)
        if channel_data:
            channel_data["owner_full_name"] = frappe.db.get_value(
                "User", channel_data["owner"], "full_name")

        return {"channel_members": member_query.run(as_dict=True), "channel_data": channel_data}
    else:
        frappe.throw("Channel {} does not exist".format(channel_id), frappe.DoesNotExistError)
