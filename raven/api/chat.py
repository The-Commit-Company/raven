import frappe
from frappe import _
from pypika import JoinType, Order

from raven.api.raven_users import get_list


@frappe.whitelist(methods=["GET"])
def get_channel_members(channel_id):
	# Check if the user has permission to view the channel
	# fetch all channel members
	# get member details from user table, such as name, full_name, user_image, first_name

	if frappe.has_permission("Raven Channel", doc=channel_id):
		member_array = []
		if frappe.db.exists("Raven Channel", channel_id):
			channel_member = frappe.qb.DocType("Raven Channel Member")
			user = frappe.qb.DocType("Raven User")
			if frappe.get_cached_value("Raven Channel", channel_id, "type") == "Open":
				# select all users, if channel member exists, get is_admin
				member_query = (
					frappe.qb.from_(user)
					.join(channel_member, JoinType.left)
					.on((user.name == channel_member.user_id) & (channel_member.channel_id == channel_id))
					.select(
						user.name,
						user.full_name,
						user.user_image,
						user.first_name,
						user.type,
						user.availability_status,
						channel_member.is_admin,
						channel_member.allow_notifications,
						channel_member.name.as_("channel_member_name"),
					)
					.orderby(channel_member.creation, order=Order.desc)
				)
			else:
				member_query = (
					frappe.qb.from_(channel_member)
					.join(user, JoinType.left)
					.on(channel_member.user_id == user.name)
					.select(
						user.name,
						user.full_name,
						user.user_image,
						user.first_name,
						user.type,
						channel_member.is_admin,
						channel_member.allow_notifications,
						channel_member.name.as_("channel_member_name"),
					)
					.where(channel_member.channel_id == channel_id)
					.orderby(channel_member.creation, order=Order.desc)
				)

			member_array = member_query.run(as_dict=True)

			member_object = {}
			for member in member_array:
				member_object[member.name] = member
			return member_object

		else:
			frappe.throw(_("Channel {} does not exist").format(channel_id), frappe.DoesNotExistError)

	else:
		frappe.throw(_("You do not have permission to view this channel"), frappe.PermissionError)
