import frappe

from raven.ai.handler import stream_response
from raven.ai.openai_client import get_open_ai_client


def handle_bot_dm(message, bot):
	"""
	 Function to handle direct messages to the bot.

	We need to start a new thread with the message and create a new conversation in OpenAI
	"""

	client = get_open_ai_client()

	# TODO: Handle various message types
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

	frappe.db.commit()  # We need to commit here since the response will be streamed, and hence might take a while

	stream_response(ai_thread_id=ai_thread.id, bot=bot, channel_id=thread_channel.name)


def handle_ai_thread_message(message, channel):
	"""
	Function to handle messages in an AI thread

	When a new message is sent, we need to send it to the OpenAI API and then stream the response
	"""

	client = get_open_ai_client()

	client.beta.threads.messages.create(
		thread_id=channel.openai_thread_id,
		role="user",
		content=message.content,
		metadata={"user": message.owner, "message": message.name},
	)

	bot = frappe.get_doc("Raven Bot", channel.thread_bot)

	stream_response(ai_thread_id=channel.openai_thread_id, bot=bot, channel_id=channel.name)
