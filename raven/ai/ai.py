import frappe

from raven.ai.handler import stream_response
from raven.ai.openai_client import get_open_ai_client


def handle_bot_dm(message, bot):
	"""
	 Function to handle direct messages to the bot.

	We need to start a new thread with the message and create a new conversation in OpenAI
	"""

	client = get_open_ai_client()

	# If the message is a poll, send a message to the user that we don't support polls for AI yet

	if message.message_type == "Poll":
		bot.send_message(
			channel_id=message.channel_id,
			text="Sorry, I don't support polls yet. Please send a text message or file.",
		)
		return

	if message.message_type in ["File", "Image"]:

		if message.message_type == "File" and not check_if_bot_has_file_search(bot, message.channel_id):
			return
		# Upload the file to OpenAI
		file = create_file_in_openai(message.file, message.message_type, client)

		content, attachments = get_content_attachment_for_file(
			message.message_type, file.id, message.file
		)

		ai_thread = client.beta.threads.create(
			messages=[
				{
					"role": "user",
					"content": content,
					"metadata": {"user": message.owner, "message": message.name},
					"attachments": attachments,
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
			"is_dm_thread": 1,
			"openai_thread_id": ai_thread.id,
			"thread_bot": bot.name,
		}
	).insert()

	# Update the message to mark it as a thread
	message.is_thread = 1
	message.save()
	# nosemgrep We need to commit here since the response will be streamed, and hence might take a while
	frappe.db.commit()

	frappe.publish_realtime(
		"ai_event",
		{
			"text": "Raven AI is thinking...",
			"channel_id": thread_channel.name,
			"bot": bot.name,
		},
		doctype="Raven Channel",
		docname=thread_channel.name,
		after_commit=True,
	)

	stream_response(ai_thread_id=ai_thread.id, bot=bot, channel_id=thread_channel.name)


def handle_ai_thread_message(message, channel):
	"""
	Function to handle messages in an AI thread

	When a new message is sent, we need to send it to the OpenAI API and then stream the response
	"""

	client = get_open_ai_client()

	bot = frappe.get_doc("Raven Bot", channel.thread_bot)

	if message.message_type in ["File", "Image"]:

		if message.message_type == "File" and not check_if_bot_has_file_search(bot, channel.name):
			return
		# Upload the file to OpenAI
		try:
			file = create_file_in_openai(message.file, message.message_type, client)
		except Exception as e:
			frappe.log_error("Raven AI Error", frappe.get_traceback())
			bot.send_message(
				channel_id=channel.name,
				text="Sorry, there was an error in processing your file. Please try again.<br/><br/>Error: "
				+ str(e),
			)
			return

		content, attachments = get_content_attachment_for_file(
			message.message_type, file.id, message.file
		)

		try:
			client.beta.threads.messages.create(
				thread_id=channel.openai_thread_id,
				role="user",
				content=content,
				metadata={"user": message.owner, "message": message.name},
				attachments=attachments,
			)
		except Exception as e:
			frappe.log_error("Raven AI Error", frappe.get_traceback())
			bot.send_message(
				channel_id=channel.name,
				text="Sorry, there was an error in processing your file. Please try again.<br/><br/>Error: "
				+ str(e),
			)
			return

	else:

		client.beta.threads.messages.create(
			thread_id=channel.openai_thread_id,
			role="user",
			content=message.content,
			metadata={"user": message.owner, "message": message.name},
		)

	frappe.publish_realtime(
		"ai_event",
		{
			"text": "Raven AI is thinking...",
			"channel_id": channel.name,
			"bot": bot.name,
		},
		doctype="Raven Channel",
		docname=channel.name,
	)

	stream_response(ai_thread_id=channel.openai_thread_id, bot=bot, channel_id=channel.name)


def check_if_bot_has_file_search(bot, channel_id):
	"""
	Checks of bot has file search. If not, send a message to the user. If yes, return True
	"""

	if not bot.enable_file_search:
		bot.send_message(
			channel_id=channel_id,
			text="Sorry, your bot does not support file search. Please enable it and try again.",
		)
		return False

	return True


def create_file_in_openai(file_url: str, message_type: str, client):
	"""
	Function to create a file in OpenAI

	We need to upload the file to OpenAI and return the file ID
	"""

	file_doc = frappe.get_doc("File", {"file_url": file_url})
	file_path = file_doc.get_full_path()

	file = client.files.create(
		file=open(file_path, "rb"), purpose="assistants" if message_type == "File" else "vision"
	)

	return file


def get_content_attachment_for_file(message_type: str, file_id: str, file_url: str):

	attachments = None

	if message_type == "File":
		content = f"Uploaded a file. URL of the file is '{file_url}'"

		FILE_SEARCH_EXCLUSIONS = [".xlsx", ".csv", ".json", ".xls"]

		tool_type = "file_search"

		for exclusion in FILE_SEARCH_EXCLUSIONS:
			if file_url.endswith(exclusion):
				tool_type = "code_interpreter"
				break

		attachments = [
			{
				"file_id": file_id,
				"tools": [{"type": tool_type}],
			}
		]
	else:
		content = [
			{"type": "text", "text": f"Uploaded an image. URL of the image is '{file_url}'"},
			{"type": "image_file", "image_file": {"file_id": file_id}},
		]

	return content, attachments
