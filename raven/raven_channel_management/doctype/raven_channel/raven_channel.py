# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class RavenChannel(Document):
	pass


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