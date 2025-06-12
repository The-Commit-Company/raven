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
    user = frappe.session.user
    now = frappe.utils.now_datetime()
    user_doc = frappe.get_doc("Raven User", frappe.session.user)

    # Cập nhật seen_at
    track_channel_seen(channel_id=channel_id, commit=True)

    # 🔥 Gửi duy nhất 1 realtime event (broadcast)
    frappe.publish_realtime(
        event="raven:channel_seen_updated",
        message={
            "channel_id": channel_id,
            "user": user,
            "seen_at": now,
            "full_name": user_doc.full_name,
            "user_image": user_doc.user_image,
        }
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

    if not channel_members:
        return []


    # Lấy danh sách user_id
    user_ids = [m["user_id"] for m in channel_members]
    users = frappe.get_all(
        "Raven User",
        filters={"name": ["in", user_ids]},
        fields=["name", "full_name", "user_image"]
    )
    user_map = {u["name"]: u for u in users}

    # Gộp thông tin
    return [
        {
            "user": m["user_id"],
            "seen_at": m["seen_at"],
            "full_name": user_map[m["user_id"]]["full_name"],
            "user_image": user_map[m["user_id"]]["user_image"],
        }
        for m in channel_members if m["user_id"] in user_map
    ]


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

@frappe.whitelist()
def mark_channel_as_unread(channel_id):
    user = frappe.session.user

    last_message = frappe.get_all(
        "Raven Message",
        filters={"channel_id": channel_id, "message_type": ["!=", "System"]},
        order_by="creation desc",
        limit=1,
        fields=["creation"],
    )

    if last_message:
        last_visit_time = last_message[0].creation
    else:
        last_visit_time = "2000-01-01 00:00:00"

    channel_member = frappe.get_doc(
        "Raven Channel Member",
        {"channel_id": channel_id, "user_id": user},
    )
    channel_member.last_visit = last_visit_time
    channel_member.save()
    frappe.db.commit()

    # Gửi realtime event đến chính user để đồng bộ trên các thiết bị khác
    frappe.publish_realtime(
        event="raven:manually_marked_updated",
        message={
            "channel_id": channel_id,
            "action": "add"
        },
        user=user
    )

    return {"message": "Channel marked as unread successfully"}

# @frappe.whitelist()
# def mark_channel_as_read(channel_id):
#     """
#     Đánh dấu channel là đã đọc bằng cách cập nhật last_visit = now()
#     cho Raven Channel Member của người dùng hiện tại.
#     """
#     user = frappe.session.user

#     # Kiểm tra người dùng có phải là thành viên của kênh không
#     channel_member = frappe.get_doc(
#         "Raven Channel Member",
#         {"channel_id": channel_id, "user_id": user},
#     )

#     # Cập nhật thời điểm xem gần nhất là thời điểm hiện tại
#     channel_member.last_visit = frappe.utils.now_datetime()
#     channel_member.save()
#     frappe.db.commit()

#     return {"message": "Channel marked as read successfully"}

