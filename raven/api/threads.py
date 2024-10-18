import frappe
from frappe import _
from frappe.query_builder import Order


@frappe.whitelist()
def get_all_threads(is_ai_thread=0):
	"""
	Get all the threads in which the user is a participant
	(We are not fetching the messages inside a thread here, just the main thread message,
	We will fetch the messages inside a thread when the user clicks on 'View Thread')
	"""

	# Fetch all channels in which is_thread = 1 and the current user is a member

	channel = frappe.qb.DocType("Raven Channel")
	channel_member = frappe.qb.DocType("Raven Channel Member")
	message = frappe.qb.DocType("Raven Message")

	query = (
		frappe.qb.from_(channel)
		.select(
			channel.name,
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
		)
		.left_join(message)
		.on(channel.name == message.name)
		.left_join(channel_member)
		.on(channel.name == channel_member.channel_id)
		.where(channel_member.user_id == frappe.session.user)
		.where(channel.is_thread == 1)
		.where(channel.is_ai_thread == is_ai_thread)
	)

	query = query.orderby(channel.last_message_timestamp, order=Order.desc)
	threads = query.run(as_dict=True)

	for thread in threads:
		# Fetch the participants of the thread
		thread["participants"] = frappe.get_all(
			"Raven Channel Member",
			filters={"channel_id": thread["name"]},
			fields=["user_id"],
		)

	return threads


@frappe.whitelist(methods="POST")
def create_thread(message_id):
	"""
	A thread can be created by any user with read access to the channel in which the message has been sent.
	The thread will be created with this user as the first participant.
	(If the user is not the sender of the message, the sender will be added as the second participant)
	"""

	thread_message = frappe.get_doc("Raven Message", message_id)

	# Convert the message to a thread
	thread_channel = frappe.get_doc(
		{
			"doctype": "Raven Channel",
			"channel_name": message_id,
			"type": "Private",
			"is_thread": 1,
			"description": thread_message.content,
		}
	).insert()

	# Add the creator of the original message as a participant
	creator = thread_message.owner

	if creator != frappe.session.user:
		frappe.get_doc(
			{"doctype": "Raven Channel Member", "channel_id": thread_channel.name, "user_id": creator}
		).insert()

	# If the thread is created in a DM channel, add both DM channel members as participants
	channel_id = thread_message.channel_id
	if channel_id:
		is_dm_channel = frappe.get_cached_value("Raven Channel", channel_id, "is_direct_message") == 1
		if is_dm_channel:
			participants = frappe.get_all(
				"Raven Channel Member",
				filters={"channel_id": channel_id},
				fields=["user_id"],
			)
			for participant in participants:
				if participant["user_id"] != creator and participant["user_id"] != frappe.session.user:
					frappe.get_doc(
						{
							"doctype": "Raven Channel Member",
							"channel_id": thread_channel.name,
							"user_id": participant["user_id"],
						}
					).insert()

	# Update the message to mark it as a thread
	thread_message.is_thread = 1
	thread_message.save(ignore_permissions=True)

	return {"channel_id": thread_message.channel_id, "thread_id": thread_channel.name}
