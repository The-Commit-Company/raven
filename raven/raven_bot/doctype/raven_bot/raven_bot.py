# Copyright (c) 2024, The Commit Company and contributors
# For license information, please see license.txt

import json

import frappe
from frappe import _
from frappe.model.document import Document

from raven.ai.openai_client import get_open_ai_client, get_openai_models
from raven.utils import get_raven_user


class RavenBot(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from raven.raven_ai.doctype.raven_bot_functions.raven_bot_functions import RavenBotFunctions

		allow_bot_to_write_documents: DF.Check
		bot_functions: DF.Table[RavenBotFunctions]
		bot_name: DF.Data
		debug_mode: DF.Check
		description: DF.SmallText | None
		dynamic_instructions: DF.Check
		enable_code_interpreter: DF.Check
		enable_file_search: DF.Check
		image: DF.AttachImage | None
		instruction: DF.LongText | None
		is_ai_bot: DF.Check
		is_standard: DF.Check
		model: DF.Data | None
		module: DF.Link | None
		openai_assistant_id: DF.Data | None
		raven_user: DF.Link | None
	# end: auto-generated types

	def validate(self):
		if self.is_ai_bot and not self.instruction:
			frappe.throw(_("Please provide an instruction for this AI Agent."))

		self.validate_functions()

	def validate_functions(self):
		if not self.allow_bot_to_write_documents:
			for f in self.bot_functions:
				needs_write = frappe.db.get_value(
					"Raven AI Function", f.function, "requires_write_permissions"
				)
				if needs_write:
					frappe.throw(
						f"This agent is not allowed to write documents. Please remove the function {f.function} or allow the agent to write documents."
					)

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

		if self.is_ai_bot:
			if not self.openai_assistant_id:
				self.create_openai_assistant()
			else:
				self.update_openai_assistant()

	def before_insert(self):
		if self.is_ai_bot and not self.openai_assistant_id:
			self.create_openai_assistant()

	def on_trash(self):
		if self.openai_assistant_id:
			self.delete_openai_assistant()

		if self.raven_user:
			frappe.db.set_value("Raven User", self.raven_user, "bot", None)
			self.db_set("raven_user", None)
			frappe.delete_doc("Raven User", self.raven_user)

	def create_openai_assistant(self):
		# Create an OpenAI Assistant for the bot
		client = get_open_ai_client()

		# Sometimes users face an issue with the OpenAI API returning an error for "model_not_found"
		# This is usually because the user has not added funds to their OpenAI account.
		# We need to show this error to the user if the openAI API returns an error for "model_not_found"

		# Use the selected model or gpt-4o-mini by default
		model_to_use = self.model or "gpt-4o-mini"

		try:
			assistant = client.beta.assistants.create(
				instructions=self.instruction,
				model=model_to_use,
				name=self.bot_name,
				description=self.description or "",
				tools=self.get_tools_for_assistant(),
			)
			
			# After creation, get the assistant to check which tools have been actually activated
			self.db_set("openai_assistant_id", assistant.id)
			self.check_and_update_enabled_tools(assistant)
			
		except Exception as e:
			if "model_not_found" in str(e):
				frappe.throw(
					_(
						f"<strong>There was an error creating the agent in OpenAI.</strong><br/>It is possible that your OpenAI account does not have enough funds or the selected model ({model_to_use}) is not available. Please check your account and try again.<br><br/>Error: {e}"
					)
				)
			else:
				frappe.throw(e)

	def update_openai_assistant(self):
		# Update the OpenAI Assistant for the bot

		# Additional check because it is being used in Raven AI Function
		if not self.is_ai_bot:
			return

		client = get_open_ai_client()

		# Use the selected model or gpt-4o-mini by default
		model_to_use = self.model or "gpt-4o-mini"

		try:
			assistant = client.beta.assistants.update(
				self.openai_assistant_id,
				instructions=self.instruction,
				name=self.bot_name,
				description=self.description or "",
				tools=self.get_tools_for_assistant(),
				model=model_to_use,
			)
			
			# After update, get the assistant to check which tools have been actually activated
			self.check_and_update_enabled_tools(assistant)
			
		except Exception as e:
			if "model_not_found" in str(e):
				frappe.throw(
					_(
						f"<strong>There was an error updating the agent in OpenAI.</strong><br/>It is possible that your OpenAI account does not have enough funds or the selected model ({model_to_use}) is not available. Please check your account and try again.<br><br/>Error: {e}"
					)
				)
			else:
				frappe.throw(e)
				
	def check_and_update_enabled_tools(self, assistant):
		"""
		Check the tools actually activated in the OpenAI assistant and update the bot fields accordingly
		"""
		try:
			# Get the list of tool types available in the assistant
			available_tools = [tool.type for tool in assistant.tools]
			
			# Check if code_interpreter and file_search are available
			code_interpreter_available = "code_interpreter" in available_tools
			file_search_available = "file_search" in available_tools
			
			# If the tools are not available but were enabled, disable them
			updates_needed = False
			update_fields = {}
			
			if self.enable_code_interpreter and not code_interpreter_available:
				update_fields["enable_code_interpreter"] = 0
				updates_needed = True
				frappe.msgprint(_(f"The model {self.model} does not support Code Interpreter. This feature has been disabled."))
			
			if self.enable_file_search and not file_search_available:
				update_fields["enable_file_search"] = 0
				updates_needed = True
				frappe.msgprint(_(f"The model {self.model} does not support File Search. This feature has been disabled."))
			
			# Update the fields if needed
			if updates_needed:
				# Update the database directly without triggering hooks
				for field, value in update_fields.items():
					self.db_set(field, value, update_modified=False)
				
		except Exception as e:
				# In case of error during the check, log but do not block the process
			frappe.log_error(
				"Raven Bot Tool Check Error",
				f"Error checking available tools for Raven Bot {self.name}: {str(e)}",
			)

	def get_tools_for_assistant(self):
		# Add the function to the assistant
		tools = []

		if self.enable_file_search:
			tools.append(
				{
					"type": "file_search",
				}
			)

		if self.enable_code_interpreter:
			tools.append(
				{
					"type": "code_interpreter",
				}
			)

		for f in self.bot_functions:
			function_def = frappe.db.get_value("Raven AI Function", f.function, "function_definition")
			if function_def:
				tools.append({"type": "function", "function": json.loads(function_def)})

		return tools

	def delete_openai_assistant(self):
		# Delete the OpenAI Assistant for the bot
		try:
			client = get_open_ai_client()
			client.beta.assistants.delete(self.openai_assistant_id)
		except Exception:
			frappe.log_error(
				f"Error deleting OpenAI Assistant {self.openai_assistant_id} for bot {self.name}"
			)

	# Raven Bot Methods

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
		self,
		channel_id: str,
		text: str = None,
		link_doctype: str = None,
		link_document: str = None,
		markdown: bool = False,
		notification_name: str = None,
	) -> str:
		"""
		Send a text message to a channel

		channel_id: The channel_id of the channel to send the message to

		You need to provide either text or link_doctype and link_document
		text: The text of the message in HTML format. If markdown is True, the text will be converted to HTML.

		Optional:
		link_doctype: The doctype of the document to link the message to
		link_document: The name of the document to link the message to
		markdown: If True, the text will be converted to HTML.

		Returns the message ID of the message sent
		"""

		if markdown:
			text = frappe.utils.md_to_html(text)
			# Remove trailing newline if it exists
			text = text.rstrip("\n")
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
				"notification": notification_name,
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
		self,
		user_id: str,
		text: str = None,
		link_doctype: str = None,
		link_document: str = None,
		markdown: bool = False,
		notification_name: str = None,
	) -> str:
		"""
		Send a text message to a user in a Direct Message channel

		user_id: The User's 'name' field to send the message to

		You need to provide either text or link_doctype and link_document
		text: The text of the message in HTML format. If markdown is True, the text will be converted to HTML.

		Optional:
		link_doctype: The doctype of the document to link the message to
		link_document: The name of the document to link the message to
		markdown: If True, the text will be converted to HTML.

		Returns the message ID of the message sent
		"""

		channel_id = self.create_direct_message_channel(user_id)

		if channel_id:
			return self.send_message(
				channel_id, text, link_doctype, link_document, markdown, notification_name
			)

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

@frappe.whitelist()
def create_or_update_raven_bot(
	bot_name,
	description=None,
	image=None,
	is_ai_bot=False,
	instruction=None,
	model="gpt-4o-mini",
	enable_code_interpreter=False,
	enable_file_search=False,
	allow_bot_to_write_documents=False,
	dynamic_instructions=False,
	debug_mode=False,
	is_standard=False,
	module=None,
	bot_functions=None,
	openai_assistant_id=None,
	bot_id=None
):
	"""
	Create or update a Raven Bot with OpenAI settings
	
	Args:
		bot_name (str): Name of the bot to create or update
		description (str, optional): Description of the bot
		image (str, optional): Image/avatar of the bot
		is_ai_bot (bool, optional): If the bot uses OpenAI's AI
		instruction (str, optional): Instructions for the OpenAI assistant
		model (str, optional): OpenAI model to use (default: gpt-4o-mini)
		enable_code_interpreter (bool, optional): Enable the code interpreter
		enable_file_search (bool, optional): Enable the file search
		allow_bot_to_write_documents (bool, optional): Allow the bot to write documents
		dynamic_instructions (bool, optional): Use dynamic instructions
		debug_mode (bool, optional): Enable the debug mode
		is_standard (bool, optional): If the bot is a standard bot
		module (str, optional): Frappe module associated
		bot_functions (list, optional): List of functions to add to the bot
		openai_assistant_id (str, optional): ID of the existing OpenAI assistant
		bot_id (str, optional): ID of the existing bot to update
		
	Returns:
		dict: Information about the bot created or updated
	"""
	# Convert the boolean parameters if necessary
	if isinstance(is_ai_bot, str):
		is_ai_bot = is_ai_bot.lower() == 'true'
	if isinstance(enable_code_interpreter, str):
		enable_code_interpreter = enable_code_interpreter.lower() == 'true'
	if isinstance(enable_file_search, str):
		enable_file_search = enable_file_search.lower() == 'true'
	if isinstance(allow_bot_to_write_documents, str):
		allow_bot_to_write_documents = allow_bot_to_write_documents.lower() == 'true'
	if isinstance(dynamic_instructions, str):
		dynamic_instructions = dynamic_instructions.lower() == 'true'
	if isinstance(debug_mode, str):
		debug_mode = debug_mode.lower() == 'true'
	if isinstance(is_standard, str):
		is_standard = is_standard.lower() == 'true'
	
	# Validate the essential parameters
	if is_ai_bot and not instruction:
		frappe.throw(_("Please provide an instruction for this AI bot."))
	
	# Parse bot_functions if it's a string
	if bot_functions and isinstance(bot_functions, str):
		bot_functions = json.loads(bot_functions)
	
	# Check if bot already exists with this name
	existing_bot_id = bot_id
	if not existing_bot_id:
		existing_bot_id = frappe.db.exists("Raven Bot", {"bot_name": bot_name})
	
	# Function to set common fields on bot document
	def set_bot_fields(bot_doc):
		bot_doc.bot_name = bot_name
		bot_doc.description = description
		if image:
			bot_doc.image = image
		bot_doc.is_ai_bot = is_ai_bot
		bot_doc.model = model
		bot_doc.instruction = instruction
		bot_doc.enable_code_interpreter = enable_code_interpreter
		bot_doc.enable_file_search = enable_file_search
		bot_doc.allow_bot_to_write_documents = allow_bot_to_write_documents
		bot_doc.dynamic_instructions = dynamic_instructions
		bot_doc.debug_mode = debug_mode
		bot_doc.is_standard = is_standard
		
		if is_standard and module:
			bot_doc.module = module
		
		if openai_assistant_id:
			bot_doc.openai_assistant_id = openai_assistant_id
			
		# Handle the bot functions if specified
		if bot_functions:
			# Clear existing functions
			bot_doc.bot_functions = []
			
			# Add the new functions
			for func in bot_functions:
				bot_doc.append("bot_functions", {
					"function": func.get("function")
				})
		
		return bot_doc
	
	try:
		if existing_bot_id:
			# Update an existing bot
			bot = frappe.get_doc("Raven Bot", existing_bot_id)
			bot = set_bot_fields(bot)
			bot.save()
			
			return {
				"bot_id": bot.name,
				"bot_name": bot.bot_name,
				"raven_user": bot.raven_user,
				"openai_assistant_id": bot.openai_assistant_id,
				"success": True,
				"message": _("Bot updated successfully"),
				"is_update": True
			}
		else:
			# Check if a bot with this name already exists before trying to create
			name_exists = frappe.db.exists("Raven Bot", {"bot_name": bot_name})
			if name_exists:
				frappe.throw(_("A bot with the name '{0}' already exists. Please use a different name or update the existing bot.").format(bot_name))
				
			# Create a new bot
			bot = frappe.new_doc("Raven Bot")
			bot = set_bot_fields(bot)
			bot.insert()
			
			return {
				"bot_id": bot.name,
				"bot_name": bot.bot_name,
				"raven_user": bot.raven_user,
				"openai_assistant_id": bot.openai_assistant_id,
				"success": True,
				"message": _("Bot created successfully"),
				"is_new": True
			}
	except Exception as e:
		frappe.log_error(f"Error in create_or_update_raven_bot", e)
		frappe.throw(_("Error processing bot: ") + str(e))
