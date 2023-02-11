# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from pypika import JoinType

class ChannelMember(Document):
	pass

@frappe.whitelist()
def get_all_channel_members(channel_id):
	# fetch all channel members 
	# get member details from user table, such as name, full_name, user_image, first_name
	channel_member = frappe.qb.DocType('Channel Member')
	user = frappe.qb.DocType('User')
	query = (frappe.qb.from_(channel_member)
            .join(user, JoinType.left)
			.on(channel_member.user_id == user.name)
			.select(channel_member.user_id, user.full_name, user.user_image, user.first_name)
			.where(channel_member.channel_id == channel_id))
	
	return query.run(as_dict=True)