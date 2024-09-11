import frappe
from frappe.utils import get_files_path

from raven.ai.handler import stream_response
from raven.ai.openai_client import get_open_ai_client


def handle_bot_dm(message, bot):
	"""
	 Function to handle direct messages to the bot.

	We need to start a new thread with the message and create a new conversation in OpenAI
	"""

	client = get_open_ai_client()

	# TODO: Handle various message types

	# If the message is a poll, send a message to the user that we don't support polls for AI yet

	if message.message_type == "Poll":
		bot.send_message(
			channel_id=message.channel_id,
			text="Sorry, I don't support polls yet. Please send a text message or file.",
		)
		return

	if message.message_type == "File" or message.message_type == "Image":
		# Upload the file to OpenAI
		file_doc = frappe.get_doc("File", {"file_url": message.file})
		file_path = file_doc.get_full_path()

		file = client.files.create(file=open(file_path, "rb"), purpose="assistants")

		ai_thread = client.beta.threads.create(
			messages=[
				{
					"role": "user",
					"content": "Uploaded a file",
					"metadata": {"user": message.owner, "message": message.name},
					"attachments": [
						{
							"file_id": file.id,
							"tools": [{"type": "file_search"}],
						}
					],
				}
			],
			metadata={
				"bot": bot.name,
				"channel": message.channel_id,
				"user": message.owner,
				"message": message.name,
			},
		)

	else:
		ai_thread = client.beta.threads.create(
			messages=[
				{
					"role": "user",
					"content": message.content,
					"metadata": {"user": message.owner, "message": message.name},
				}
			],
			metadata={
				"bot": bot.name,
				"channel": message.channel_id,
				"user": message.owner,
				"message": message.name,
			},
		)

	thread_channel = frappe.get_doc(
		{
			"doctype": "Raven Channel",
			"channel_name": message.name,
			"type": "Private",
			"is_thread": 1,
			"is_ai_thread": 1,
			"openai_thread_id": ai_thread.id,
			"thread_bot": bot.name,
		}
	).insert()

	# Update the message to mark it as a thread
	message.is_thread = 1
	message.save()
	# nosemgrep We need to commit here since the response will be streamed, and hence might take a while
	frappe.db.commit()

	stream_response(ai_thread_id=ai_thread.id, bot=bot, channel_id=thread_channel.name)


def handle_ai_thread_message(message, channel):
	"""
	Function to handle messages in an AI thread

	When a new message is sent, we need to send it to the OpenAI API and then stream the response
	"""

	client = get_open_ai_client()

	if message.message_type == "File" or message.message_type == "Image":
		# Upload the file to OpenAI
		file_doc = frappe.get_doc("File", {"file_url": message.file})
		file_path = file_doc.get_full_path()

		file = client.files.create(file=open(file_path, "rb"), purpose="assistants")

		client.beta.threads.messages.create(
			thread_id=channel.openai_thread_id,
			role="user",
			content="Uploaded a file",
			metadata={"user": message.owner, "message": message.name},
			attachments=[{"file_id": file.id, "tools": [{"type": "file_search"}]}],
		)

	else:

		client.beta.threads.messages.create(
			thread_id=channel.openai_thread_id,
			role="user",
			content=message.content,
			metadata={"user": message.owner, "message": message.name},
		)

	bot = frappe.get_doc("Raven Bot", channel.thread_bot)

	stream_response(ai_thread_id=channel.openai_thread_id, bot=bot, channel_id=channel.name)
