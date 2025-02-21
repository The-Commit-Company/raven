import frappe
from frappe import _
from frappe.query_builder import Order
from frappe.query_builder.functions import Coalesce, Count

from raven.api.raven_channel import get_peer_user_id
from raven.utils import get_channel_members


@frappe.whitelist()
def get_all_threads(workspace: str = None, content=None, channel_id=None, is_ai_thread=0):
	"""
	Get all the threads in which the user is a participant
	(We are not fetching the messages inside a thread here, just the main thread message,
	We will fetch the messages inside a thread when the user clicks on 'View Thread')
	"""

	# Fetch all channels in which is_thread = 1 and the current user is a member

	channel = frappe.qb.DocType("Raven Channel")
	channel_member = frappe.qb.DocType("Raven Channel Member")
	message = frappe.qb.DocType("Raven Message").as_("message")
	thread_messages = frappe.qb.DocType("Raven Message").as_("thread_messages")

	query = (
		frappe.qb.from_(channel)
		.select(
			channel.name,
			channel.workspace,
			channel.last_message_timestamp,
			channel.last_message_details,
			message.name.as_("thread_message_id"),
			message.channel_id,
			message.message_type,
			message.text,
			message.content,
			message.file,
			message.poll_id,
			message.is_bot_message,
			message.bot,
			message.hide_link_preview,
			message.link_doctype,
			message.link_document,
			message.image_height,
			message.image_width,
			message.owner,
			message.creation,
			Count(thread_messages.name).as_("reply_count"),
		)
		.left_join(message)
		.on((message.is_thread == 1) & (message.name == channel.name))
		.left_join(channel_member)
		.on(
			(channel.name == channel_member.channel_id) & (channel_member.user_id == frappe.session.user)
		)
		.left_join(thread_messages)
		.on(channel.name == thread_messages.channel_id)
		.where(channel_member.user_id == frappe.session.user)
		.where(channel.is_thread == 1)
		.where(channel.is_ai_thread == is_ai_thread)
		.groupby(channel.name)
	)

	if workspace:
		query = query.where((channel.workspace == workspace) | (channel.is_dm_thread == 1))

	if content:
		query = query.where(message.content.like(f"%{content}%"))

	if channel_id and channel_id != "all":
		query = query.where(message.channel_id == channel_id)

	query = query.orderby(channel.last_message_timestamp, order=Order.desc)

	# return
	threads = query.run(as_dict=True)

	for thread in threads:
		# Fetch the participants of the thread
		thread_members = get_channel_members(thread["name"])
		thread["participants"] = [{"user_id": member} for member in thread_members]

	return threads


@frappe.whitelist()
def get_unread_threads(workspace: str = None):
	"""
	Get the number of threads in which the user is a participant and has unread messages > 0
	"""

	channel = frappe.qb.DocType("Raven Channel")
	channel_member = frappe.qb.DocType("Raven Channel Member")
	message = frappe.qb.DocType("Raven Message")

	query = (
		frappe.qb.from_(channel)
		.select(channel.name, Count(message.name).as_("unread_count"))
		.left_join(channel_member)
		.on(
			(channel.name == channel_member.channel_id) & (channel_member.user_id == frappe.session.user)
		)
		.left_join(message)
		.on(channel.name == message.channel_id)
		.where(channel.is_thread == 1)
		.where(channel.is_ai_thread == 0)
		.where(message.creation > Coalesce(channel_member.last_visit, "2000-11-11"))
		.where(channel_member.user_id == frappe.session.user)
		.groupby(channel.name)
	)

	if workspace:
		query = query.where((channel.workspace == workspace) | (channel.is_dm_thread == 1))

	return query.run(as_dict=True)


@frappe.whitelist(methods="POST")
def create_thread(message_id):
	"""
	A thread can be created by any user with read access to the channel in which the message has been sent.
	The thread will be created with this user as the first participant.
	(If the user is not the sender of the message, the sender will be added as the second participant)
	"""

	thread_message = frappe.get_doc("Raven Message", message_id)

	channel_doc = frappe.get_cached_doc("Raven Channel", thread_message.channel_id)

	# Convert the message to a thread
	thread_channel = frappe.get_doc(
		{
			"doctype": "Raven Channel",
			"channel_name": message_id,
			"workspace": channel_doc.workspace,
			"type": "Private",
			"is_thread": 1,
			"is_dm_thread": channel_doc.is_direct_message,
			"description": thread_message.content,
		}
	).insert()

	# Add the creator of the original message as a participant
	creator = thread_message.owner

	if creator != frappe.session.user:
		frappe.get_doc(
			{"doctype": "Raven Channel Member", "channel_id": thread_channel.name, "user_id": creator}
		).insert(ignore_permissions=True)

	else:
		# By now, the creator of the thread and the creator of the original message should be added as participants

		# In a DM channel (not self message), it is possible that the creator of the thread is also the creator of the original message
		# In this case, the creator is already a participant of the thread, but it's peer is not.

		if channel_doc.is_direct_message == 1 and not channel_doc.is_self_message:
			# Get the peer of the DM channel
			peer_user_id = get_peer_user_id(channel_doc.name, 1)

			if peer_user_id:
				frappe.get_doc(
					{
						"doctype": "Raven Channel Member",
						"channel_id": thread_channel.name,
						"user_id": peer_user_id,
					}
				).insert(ignore_permissions=True)

	# Update the message to mark it as a thread
	thread_message.is_thread = 1
	thread_message.save(ignore_permissions=True)

	return {"channel_id": thread_message.channel_id, "thread_id": thread_channel.name}
