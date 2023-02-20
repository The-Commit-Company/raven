# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from pypika import JoinType


class RavenChannelMember(Document):
    pass


@frappe.whitelist()
def get_channel_members_and_data(channel_id):
    # fetch all channel members
    # get member details from user table, such as name, full_name, user_image, first_name
    channel_member = frappe.qb.DocType('Raven Channel Member')
    channel_data = frappe.qb.DocType('Raven Channel')
    user = frappe.qb.DocType('User')
    member_query = (frappe.qb.from_(channel_member)
                    .join(user, JoinType.left)
                    .on(channel_member.user_id == user.name)
                    .select(user.name, user.full_name, user.user_image, user.first_name)
                    .where(channel_member.channel_id == channel_id))
    data_query = (frappe.qb.from_(channel_data)
                  .select(channel_data.channel_name, channel_data.type, channel_data.creation, channel_data.owner, channel_data.channel_description)
                  .where(channel_data.name == channel_id))

    return {"channel_members": member_query.run(as_dict=True), "channel_data": data_query.run(as_dict=True)}
