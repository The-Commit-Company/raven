# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

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
