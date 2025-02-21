import frappe
from frappe import _

from raven.utils import delete_channel_members_cache, get_channel_member, track_channel_visit


@frappe.whitelist()
def remove_channel_member(user_id, channel_id):
	# Get raven channel member name where user_id and channel_id match
	member = get_channel_member(channel_id, user_id)
	# Delete raven channel member
	if member:
		frappe.delete_doc("Raven Channel Member", member["name"])
	else:
		frappe.throw(_("User is not a member of this channel"))

	return True


@frappe.whitelist(methods=["POST"])
def track_visit(channel_id):
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

	delete_channel_members_cache(channel_id)
	return True
