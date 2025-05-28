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
def track_visit(channel_id, last_seen_sequence=None):
    if last_seen_sequence is not None:
        last_seen_sequence = int(last_seen_sequence)

    track_channel_visit(
        channel_id=channel_id,
        commit=True,
        last_seen_sequence=last_seen_sequence
    )

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
    # Query SQL để lấy thông tin member và user liên quan
    data = frappe.db.sql("""
        SELECT
            m.user_id,
            m.seen_at,
            m.last_seen_sequence,
            u.full_name,
            u.user_image
        FROM
            `tabRaven Channel Member` m
        LEFT JOIN
            `tabRaven User` u ON u.name = m.user_id
        WHERE
            m.channel_id = %s
    """, (channel_id,), as_dict=True)

    return data



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

    from datetime import timedelta

    if last_message:
        last_visit_time = last_message[0].creation  # Không lùi 1 giây
    else:
        last_visit_time = "2000-01-01 00:00:00"

    channel_member = frappe.get_doc(
        "Raven Channel Member",
        {"channel_id": channel_id, "user_id": user},
    )
    channel_member.last_visit = last_visit_time
    channel_member.save()
    frappe.db.commit()

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

