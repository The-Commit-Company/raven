import frappe
from frappe import _

from raven.api.raven_users import get_list
from raven.utils import get_channel_members as get_channel_members_util


@frappe.whitelist(methods=["GET"])
def get_channel_members(channel_id):
	# Check if the user has permission to view the channel
	# fetch all channel members
	# get member details from user table, such as name, full_name, user_image, first_name

	frappe.has_permission("Raven Channel", doc=channel_id, throw=True)

	member_object = {}

	# This is an array
	all_users = get_list()

	# This is a dictionary
	channel_members = get_channel_members_util(channel_id)

	channel_type = frappe.get_cached_value("Raven Channel", channel_id, "type")

	if channel_type == "Open":
		# Merge the users and channel members
		for member in all_users:
			channel_member = channel_members.get(member.name, {})

			member_object[member.name] = {
				"name": member.name,
				"full_name": member.full_name,
				"user_image": member.user_image,
				"first_name": member.first_name,
				"type": member.type,
				"availability_status": member.availability_status,
				"is_admin": channel_member.get("is_admin", 0),
				"allow_notifications": channel_member.get("allow_notifications", 1),
				"channel_member_name": channel_member.get("name", None),
			}

	else:
		for member in channel_members:
			channel_member = channel_members[member]
			user_obj = next((u for u in all_users if u.name == member), None)

			if user_obj:
				member_object[user_obj.name] = {
					"name": user_obj.name,
					"full_name": user_obj.full_name,
					"user_image": user_obj.user_image,
					"first_name": user_obj.first_name,
					"type": user_obj.type,
					"availability_status": user_obj.availability_status,
					"is_admin": channel_member.is_admin,
					"allow_notifications": channel_member.allow_notifications,
					"channel_member_name": channel_member.name,
				}

	return member_object
