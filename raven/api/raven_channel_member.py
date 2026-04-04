import frappe
from frappe import _

from raven.utils import delete_channel_members_cache, get_channel_member
from raven.utils import get_channel_members as get_channel_members_util
from raven.utils import get_workspace_members, track_channel_visit


@frappe.whitelist()
def remove_channel_member(user_id: str, channel_id: str):
	# Get raven channel member name where user_id and channel_id match
	member = get_channel_member(channel_id, user_id)
	# Delete raven channel member
	if member:
		frappe.delete_doc("Raven Channel Member", member["name"])
	else:
		frappe.throw(_("User is not a member of this channel"))

	return True


@frappe.whitelist(methods=["POST"])
def track_visit(channel_id: str):
	"""
	Track the last visit of the user to the channel.
	This is usually called when the user exits the channel (unmounts the component) after loading the latest messages in it.
	"""
	track_channel_visit(channel_id=channel_id, commit=True)
	return True


@frappe.whitelist(methods=["POST"])
def add_channel_members(channel_id: str, members: list[str]):
	"""
	Add members to a channel
	"""

	# Since this is a bulk operation, we need to disable cache invalidation (will be handled manually) and ignore permissions (since we already have permission to add members)

	for member in members:
		member_doc = frappe.get_doc(
			{"doctype": "Raven Channel Member", "channel_id": channel_id, "user_id": member}
		)
		member_doc.flags.ignore_cache_invalidation = True
		member_doc.insert()

	if not members:
		return True

	delete_channel_members_cache(channel_id)
	return True


@frappe.whitelist(methods=["GET"])
def get_channel_members(channel_id: str):
	frappe.has_permission("Raven Channel", doc=channel_id, throw=True)

	members_object = {}

	# This is a dictionary
	channel_members = get_channel_members_util(channel_id)

	channel_type = frappe.get_cached_value("Raven Channel", channel_id, "type")

	if channel_type == "Open":
		workspace = frappe.get_cached_value("Raven Channel", channel_id, "workspace")
		workspace_members = get_workspace_members(workspace)

		# All workspace members are members of an open channel - merge the workspace members with channel members
		for workspace_member in workspace_members:
			channel_member = channel_members.get(workspace_member, {})

			members_object[workspace_member] = {
				"is_admin": channel_member.get("is_admin", 0),
				"channel_member_name": channel_member.get("name", None),
			}

	else:
		for member in channel_members:
			channel_member = channel_members[member]

			members_object[member] = {
				"is_admin": channel_member.is_admin,
				"channel_member_name": channel_member.name,
			}

	return members_object
