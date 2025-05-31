import frappe
from frappe import _
from frappe.query_builder import Order

from raven.api.raven_users import get_current_raven_user
from raven.utils import get_channel_members, is_channel_member, track_channel_visit

from frappe.query_builder import DocType



@frappe.whitelist()
def get_all_channels(hide_archived=True):
	"""
	Fetches all channels where current user is a member - both channels and DMs
	To be used on the web app.
	"""

	if hide_archived == "false":
		hide_archived = False

	# 1. Get "channels" - public, open, private, and DMs
	channels = get_channel_list(hide_archived)

	# 3. For every channel, we need to fetch the peer's User ID (if it's a DM)
	parsed_channels = []
	for channel in channels:
		parsed_channel = {
			**channel,
			"peer_user_id": get_peer_user_id(
				channel.get("name"),
				channel.get("is_direct_message"),
				channel.get("is_self_message"),
			),
		}

		parsed_channels.append(parsed_channel)

	channel_list = [channel for channel in parsed_channels if not channel.get("is_direct_message")]
	dm_list = [channel for channel in parsed_channels if channel.get("is_direct_message")]

	return {"channels": channel_list, "dm_channels": dm_list}


def get_channel_list(hide_archived=False):
	"""
	get List of all channels where current user is a member (all includes public, private, open, and DM channels)
	"""
	channel = frappe.qb.DocType("Raven Channel")
	channel_member = frappe.qb.DocType("Raven Channel Member")

	workspace_member = frappe.qb.DocType("Raven Workspace Member")

	query = (
		frappe.qb.from_(channel)
		.select(
			channel.name,
            channel.is_done,   
			channel.channel_name,
			channel.type,
			channel.channel_description,
			channel.is_archived,
			channel.is_direct_message,
			channel.is_self_message,
			channel.creation,
			channel.owner,
			channel.last_message_timestamp,
			channel.last_message_details,
			channel.pinned_messages_string,
			channel.workspace,
			channel_member.name.as_("member_id"),
		)
		.left_join(channel_member)
		.on(
			(channel.name == channel_member.channel_id) & (channel_member.user_id == frappe.session.user)
		)
		.left_join(workspace_member)
		.on(
			(channel.workspace == workspace_member.workspace)
			& (workspace_member.user == frappe.session.user)
		)
		.where(
			((channel.is_direct_message == 1) & (channel_member.user_id == frappe.session.user))
			| (
				(workspace_member.user == frappe.session.user)
				& ((channel.type != "Private") | (channel_member.user_id == frappe.session.user))
			)
		)
		.where(channel.is_thread == 0)
	)

	if hide_archived:
		query = query.where(channel.is_archived == 0)

	query = query.orderby(channel.last_message_timestamp, order=Order.desc)

	return query.run(as_dict=True)

@frappe.whitelist()
def get_list_channel_ok():
    """
    Trả về danh sách các channel đã đánh dấu 'is_done = 1'
    và user hiện tại là thành viên
    """
    Channel = DocType("Raven Channel")
    Member = DocType("Raven Channel Member")

    query = (
        frappe.qb.from_(Channel)
        .join(Member)
        .on(Channel.name == Member.channel_id)
        .select(
            Channel.name,
            Channel.channel_name,
            Channel.is_done,
            Channel.last_message_timestamp,
            Channel.is_direct_message,
            Channel.type
        )
        .where(
            (Channel.is_done == 1) &
            (Member.user_id == frappe.session.user)
        )
        .orderby(Channel.last_message_timestamp, order=Order.desc)
    )

    results = query.run(as_dict=True)
    return results

@frappe.whitelist(methods=["POST"])
def set_done_ok(channelID: str):
    """
    Đánh dấu channel là đã hoàn thành (is_done = 1)
    """
    if not frappe.has_permission("Raven Channel", channelID, "write"):
        frappe.throw("Bạn không có quyền chỉnh sửa channel này.")

    frappe.db.set_value("Raven Channel", channelID, "is_done", 1)
    frappe.db.commit()

    return {"status": "success", "channel": channelID, "is_done": 1}


@frappe.whitelist(methods=["POST"])
def set_done_not_ok(channelID: str):
    """
    Đánh dấu channel là chưa hoàn thành (is_done = 0)
    """
    if not channelID:
        frappe.throw("Thiếu channelID")

    if not frappe.has_permission("Raven Channel", channelID, "write"):
        frappe.throw("Bạn không có quyền chỉnh sửa channel này.")

    frappe.db.set_value("Raven Channel", channelID, "is_done", 0)
    frappe.db.commit()

    return {"status": "success", "channel": channelID, "is_done": 0}


@frappe.whitelist()
def get_channels(hide_archived=False):
	channels = get_channel_list(hide_archived)
	for channel in channels:
		peer_user_id = get_peer_user_id(
			channel.get("name"), channel.get("is_direct_message"), channel.get("is_self_message")
		)
		channel["peer_user_id"] = peer_user_id
		if peer_user_id:
			user_full_name = frappe.get_cached_value("User", peer_user_id, "full_name")
			channel["full_name"] = user_full_name
	return channels


def get_peer_user(channel_id: str, is_direct_message: int, is_self_message: bool = False) -> dict:
	"""
	For a given channel, fetches the peer's member object
	"""
	if is_direct_message == 0:
		return None
	if is_self_message:
		return {
			"user_id": frappe.session.user,
		}

	members = get_channel_members(channel_id)

	for member in members:
		if member != frappe.session.user:
			return members[member]

	return None


def get_peer_user_id(
	channel_id: str, is_direct_message: int, is_self_message: bool = False
) -> str:
	"""
	For a given channel, fetches the user id of the peer
	"""
	peer_user = get_peer_user(channel_id, is_direct_message, is_self_message)
	if peer_user:
		return peer_user.get("user_id")
	return None


@frappe.whitelist(methods=["POST"])
def create_direct_message_channel(user_id):
	"""
	Creates a direct message channel between current user and the user with user_id
	The user_id can be the peer or the user themself
	1. Check if a channel already exists between the two users
	2. If not, create a new channel
	3. Check if the user_id is the current user and set is_self_message accordingly
	"""
	# TODO: this logic might break if the user_id changes
	channel_name = frappe.db.get_value(
		"Raven Channel",
		filters={
			"is_direct_message": 1,
			"channel_name": [
				"in",
				[frappe.session.user + " _ " + user_id, user_id + " _ " + frappe.session.user],
			],
		},
		fieldname="name",
	)
	if channel_name:
		return channel_name
	# create direct message channel with user and current user
	else:
		channel = frappe.get_doc(
			{
				"doctype": "Raven Channel",
				"channel_name": frappe.session.user + " _ " + user_id,
				"is_direct_message": 1,
				"is_self_message": frappe.session.user == user_id,
			}
		)
		channel.insert()
		return channel.name


@frappe.whitelist(methods=["POST"])
def toggle_pinned_channel(channel_id):
	"""
	Toggles the pinned status of the channel
	"""
	raven_user = get_current_raven_user()
	pinned_channels = raven_user.pinned_channels or []

	is_pinned = False
	for pin in pinned_channels:
		if pin.channel_id == channel_id:
			raven_user.remove(pin)
			is_pinned = True
			break

	if not is_pinned:
		raven_user.append("pinned_channels", {"channel_id": channel_id})

	raven_user.save()

	return raven_user


@frappe.whitelist()
def leave_channel(channel_id):
	"""
	Leave a channel
	"""
	members = frappe.get_all(
		"Raven Channel Member",
		filters={"channel_id": channel_id, "user_id": frappe.session.user},
	)

	for member in members:
		frappe.delete_doc("Raven Channel Member", member.name)

	return "Ok"


@frappe.whitelist()
def toggle_pin_message(channel_id, message_id):
	"""
	Toggle pin/unpin a message in a channel.
	"""
	channel = frappe.get_doc("Raven Channel", channel_id)

	# Check if the user is a member of the channel
	if not is_channel_member(channel_id):
		frappe.throw(_("You are not a member of this channel"))

	pinned_message = None

	# Check whether the message exists in the channel
	message_exists = frappe.db.get_value("Raven Message", message_id, "channel_id") == channel_id

	if not message_exists:
		frappe.throw(_("Message does not exist in this channel"))

		# Check if the message is already pinned
	for pm in channel.pinned_messages:
		if pm.message_id == message_id:
			pinned_message = pm
			break

	if pinned_message:
		# Unpin the message
		channel.remove(pinned_message)
	else:
		# Pin the message if it's not pinned
		channel.append("pinned_messages", {"message_id": message_id})

	channel.save(ignore_permissions=True)

	return "Ok"


@frappe.whitelist()
def mark_all_messages_as_read(channel_ids: list):
	"""
	Mark all messages in these channels as read
	"""
	user = frappe.session.user
	for channel_id in channel_ids:
		track_channel_visit(channel_id, user=user)

	return "Ok"

@frappe.whitelist()
def get_unread_channels():
    """
    Trả về danh sách các channel mà user hiện tại có tin nhắn chưa đọc
    """
    from frappe.utils import get_datetime

    user = frappe.session.user
    channel = frappe.qb.DocType("Raven Channel")
    channel_member = frappe.qb.DocType("Raven Channel Member")

    query = (
        frappe.qb.from_(channel)
        .join(channel_member)
        .on(
            (channel.name == channel_member.channel_id)
            & (channel_member.user_id == user)
        )
        .select(
            channel.name,
            channel.channel_name,
            channel.is_direct_message,
            channel.is_self_message,
            channel.last_message_timestamp,
            channel_member.last_visit
        )
        .where(
            (channel.last_message_timestamp.isnotnull())
            & (
                (channel_member.last_visit.isnull())
                | (channel.last_message_timestamp > channel_member.last_visit)
            )
        )
        .orderby(channel.last_message_timestamp, order=Order.desc)
    )

    unread_channels = query.run(as_dict=True)

    # thêm peer_user_id nếu là direct message
    for ch in unread_channels:
        ch["peer_user_id"] = get_peer_user_id(
            ch["name"], ch["is_direct_message"], ch["is_self_message"]
        )

    return unread_channels
