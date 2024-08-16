import frappe
from frappe import _


@frappe.whitelist()
def get_all_threads():
	# Get all the threads in which the user is a participant
	# (We are not fetching the messages inside a thread here, just the main thread message,
	# We will fetch the messages inside a thread when the user clicks on 'View Thread')
	# Fetch all messages in which is_thread = 1 and the user is a participant (i.e. the user is in the Raven Thread Participant table)
	threads = frappe.get_all(
		"Raven Message",
		filters=[["is_thread", "=", 1], ["Raven Thread Participant", "user", "=", frappe.session.user]],
		fields=[
			"name",
			"channel_id",
			"message_type",
			"text",
			"content",
			"file",
			"image_width",
			"image_height",
			"message_reactions",
			"is_edited",
			"poll_id",
			"is_bot_message",
			"bot",
			"hide_link_preview",
			"owner",
			"creation",
			"is_thread",
			"thread_id",
			"is_thread_message",
			"thread_messages_count",
		],
	)
	for thread in threads:
		# Get all the participants for each thread
		participants = frappe.get_all(
			"Raven Thread Participant",
			filters={"parent": thread.name},
			fields=["user", "user_image", "full_name"],
		)
		thread.thread_participants = participants

	return threads


@frappe.whitelist(methods="POST")
def create_thread(message_id):
	"""
	A thread can be created by any user with read access to the channel in which the message has been sent.
	The thread will be created with this user as the first participant.
	(If the user is not the sender of the message, the sender will be added as the second participant)
	"""

	# Convert the message to a thread
	thread_channel = frappe.get_doc(
		{
			"doctype": "Raven Channel",
			"channel_name": message_id,
			"type": "Private",
			"is_thread": 1,
		}
	).insert()

	# Add the creator of the original message as a participant
	creator = frappe.get_cached_value("Raven Message", message_id, "owner")

	if creator != frappe.session.user:
		frappe.get_doc(
			{"doctype": "Raven Channel Member", "channel_id": thread_channel.name, "user_id": creator}
		).insert()
	thread_message = frappe.get_cached_doc("Raven Message", message_id)
	thread_message.is_thread = 1
	thread_message.save(ignore_permissions=True)

	return "Thread created"
