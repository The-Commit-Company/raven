# Copyright (c) 2024, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

from raven.utils import get_raven_user


class RavenBot(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		bot_name: DF.Data
		description: DF.SmallText | None
		image: DF.AttachImage | None
		is_standard: DF.Check
		module: DF.Link | None
		raven_user: DF.Link | None
	# end: auto-generated types

	def on_update(self):
		"""
		When a bot is updated, create/update the Raven User for it

		TODO: Generate JSON files when a Standard Bot is created or updated
		"""
		if self.raven_user:
			raven_user = frappe.get_doc("Raven User", self.raven_user)
			raven_user.type = "Bot"
			raven_user.bot = self.name
			raven_user.full_name = self.bot_name
			raven_user.first_name = self.bot_name
			raven_user.user_image = self.image
			raven_user.enabled = 1
			raven_user.save()
		else:
			raven_user = frappe.new_doc("Raven User")
			raven_user.type = "Bot"
			raven_user.bot = self.name
			raven_user.full_name = self.bot_name
			raven_user.first_name = self.bot_name
			raven_user.user_image = self.image
			raven_user.enabled = 1
			raven_user.save()

			self.db_set("raven_user", raven_user.name)

	def is_member(self, channel_id: str) -> None | str:
		"""
		Check if the bot is a member of the channel
		Returns None if the bot is not a member of the channel
		Returns the member_id if the bot is a member of the channel
		"""
		member_id = frappe.db.exists(
			"Raven Channel Member", {"channel_id": channel_id, "user_id": self.raven_user}
		)
		if member_id:
			return member_id
		return None

	def add_to_channel(self, channel_id: str) -> str:
		"""
		Add the bot to a channel as a member

		If the bot is already a member of the channel, this function does nothing

		Returns the member_id of the bot in the channel
		"""

		existing_member = self.is_member(channel_id)

		if not existing_member:
			raven_channel_member = frappe.get_doc(
				doctype="Raven Channel Member", user_id=self.raven_user, channel_id=channel_id
			)
			raven_channel_member.insert()
			return raven_channel_member.name
		else:
			return existing_member

	def remove_from_channel(self, channel_id: str) -> None:
		"""
		Remove the bot from a channel as a member
		"""

		existing_member = self.is_member(channel_id)
		if existing_member:
			frappe.delete_doc("Raven Channel Member", existing_member)

	def get_dm_channel_id(self, user_id: str) -> str | None:
		"""
		Get the channel_id of a Direct Message channel with a user
		"""
		# The User's Raven User ID
		user_raven_user = frappe.db.get_value("Raven User", {"user": user_id}, "name")
		if not user_raven_user:
			return None
		channel_name = frappe.db.get_value(
			"Raven Channel",
			filters={
				"is_direct_message": 1,
				"channel_name": [
					"in",
					[self.raven_user + " _ " + user_raven_user, user_raven_user + " _ " + self.raven_user],
				],
			},
		)
		if channel_name:
			return channel_name
		return None

	def send_message(
		self, channel_id: str, text: str = None, link_doctype: str = None, link_document: str = None
	) -> str:
		"""
		Send a text message to a channel

		channel_id: The channel_id of the channel to send the message to

		You need to provide either text or link_doctype and link_document
		text: The text of the message in HTML format (markdown is not supported)

		Optional:
		link_doctype: The doctype of the document to link the message to
		link_document: The name of the document to link the message to

		Returns the message ID of the message sent
		"""
		doc = frappe.get_doc(
			{
				"doctype": "Raven Message",
				"channel_id": channel_id,
				"text": text,
				"message_type": "Text",
				"is_bot_message": 1,
				"bot": self.raven_user,
				"link_doctype": link_doctype,
				"link_document": link_document,
			}
		)
		# Bots can probably send messages without permissions? Upto the end user to create bots.
		# Besides sending messages is not a security concern, unauthorized reading of messages is.
		doc.insert(ignore_permissions=True)
		return doc.name

	def create_direct_message_channel(self, user_id: str) -> str:
		"""
		Creates a direct message channel between the bot and a user

		If the channel already exists, returns the channel_id of the existing channel

		Throws an error if the user is not a Raven User
		"""
		channel_id = self.get_dm_channel_id(user_id)

		if channel_id:
			return channel_id
		else:
			# The user's raven_user document
			user_raven_user = get_raven_user(user_id)
			if not user_raven_user:
				frappe.throw(f"User {user_id} is not added as a Raven User")
			channel = frappe.get_doc(
				{
					"doctype": "Raven Channel",
					"channel_name": self.raven_user + " _ " + user_raven_user,
					"is_direct_message": 1,
				}
			)
			channel.flags.is_created_by_bot = True
			channel.insert()
			return channel.name

	def send_direct_message(
		self, user_id: str, text: str = None, link_doctype: str = None, link_document: str = None
	) -> str:
		"""
		Send a text message to a user in a Direct Message channel

		user_id: The User's 'name' field to send the message to

		You need to provide either text or link_doctype and link_document
		text: The text of the message in HTML format (markdown is not supported)

		Optional:
		link_doctype: The doctype of the document to link the message to
		link_document: The name of the document to link the message to

		Returns the message ID of the message sent
		"""

		channel_id = self.create_direct_message_channel(user_id)

		if channel_id:
			return self.send_message(channel_id, text, link_doctype, link_document)

	def get_last_message(self, channel_id: str = None, message_type: str = None) -> Document | None:
		"""
		Gets the last message sent by the bot
		"""
		filters = {"bot": self.name}
		if channel_id is not None:
			filters["channel_id"] = channel_id
		if message_type is not None:
			filters["message_type"] = message_type

		return frappe.get_last_doc("Raven Message", filters=filters, order_by="creation desc")

	def get_previous_messages(
		self, channel_id: str = None, message_type: str = None, date: str = None
	) -> list[str]:
		"""
		Gets the previous messages sent by the bot
		"""
		filters = {"bot": self.name}
		if channel_id is not None:
			filters["channel_id"] = channel_id
		if message_type is not None:
			filters["message_type"] = message_type
		if date is not None:
			filters["creation"] = [">", date]

		return frappe.get_all("Raven Message", filters=filters, order_by="creation desc", pluck="name")
