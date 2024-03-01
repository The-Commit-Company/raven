# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

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
        organization: DF.Link | None
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
