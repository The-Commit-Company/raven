import frappe
from frappe import _

from raven.utils import delete_channel_members_cache, get_channel_member, track_channel_visit ,track_channel_seen


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
    track_channel_visit(channel_id=channel_id, commit=True)

    return True

@frappe.whitelist(methods=["POST"])
def track_seen(channel_id):
    track_channel_seen(channel_id=channel_id, commit=True)

    members = frappe.get_all("Raven Channel Member", filters={"channel_id": channel_id}, pluck="user_id")

    for member in members:
        if member != frappe.session.user:
            frappe.publish_realtime(
                event="channel_seen_updated",
                message={
                    "channel_id": channel_id,
                    "user": frappe.session.user,
                    "seen_at": frappe.utils.now_datetime()
                },
                user=member
            )

    return True


@frappe.whitelist()
def get_seen_info(channel_id: str):
	# Lấy tất cả member của kênh
    channel_members = frappe.get_all(
        "Raven Channel Member",
        filters={"channel_id": channel_id},
        fields=["user_id", "seen_at"]
    )

    # Lấy danh sách user_id
    user_ids = [m["user_id"] for m in channel_members]
    users = frappe.get_all(
        "Raven User",
        filters={"name": ["in", user_ids]},
        fields=["name", "full_name", "user_image"]
    )
    user_info_map = {u["name"]: u for u in users}

    # Gộp thông tin
    result = []
    for member in channel_members:
        user = user_info_map.get(member["user_id"])
        if user:
            result.append({
                "user": member["user_id"],
                "seen_at": member["seen_at"],
                "full_name": user["full_name"],
                "user_image": user["user_image"]
            })
    return result


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
