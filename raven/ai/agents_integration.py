"""
Improved agents integration with better import handling based on Desktop Raven approach.
"""

import asyncio
import traceback

import frappe

# Import agents SDK - the package is called 'agents' not 'openai_agents'
from agents import (
	Agent,
	CodeInterpreterTool,
	ModelSettings,
	Runner,
	Tool,
	function_tool,
	set_default_openai_client,
)
from frappe import _
from openai import AsyncOpenAI

from .functions import (
	cancel_document,
	create_document,
	delete_document,
	get_document,
	get_list,
	submit_document,
	update_document,
)


class RavenAgentManager:
	"""Manages Raven agents with local LLM/OpenAI support"""

	def __init__(self, bot_doc, file_handler=None):
		self.bot_doc = bot_doc
		self.settings = frappe.get_single("Raven Settings")
		self.file_handler = file_handler
		self._setup_client()
		self._setup_tools()

	def _setup_client(self):
		"""Configure OpenAI client based on provider"""
		if self.bot_doc.model_provider == "Local LLM" and self.settings.enable_local_llm:
			# Client for local LLM
			if not self.settings.local_llm_api_url:
				frappe.throw(_("Local LLM API URL is not configured in Raven Settings"))

			client = AsyncOpenAI(
				api_key="not-needed",  # LM Studio doesn't require API key
				base_url=self.settings.local_llm_api_url,
			)
		else:
			# Standard OpenAI client
			api_key = self.settings.get_password("openai_api_key")
			if not api_key:
				frappe.throw(_("OpenAI API key is not configured in Raven Settings"))

			client = AsyncOpenAI(
				api_key=api_key,
				organization=self.settings.openai_organisation_id,
				project=self.settings.openai_project_id if self.settings.openai_project_id else None,
			)

		# Set default client for SDK
		set_default_openai_client(client)
		self.client = client

	async def _test_api_connection(self):
		"""Test API connection before creating agent"""
		try:
			# Try a simple completion to test connectivity
			test_response = await self.client.chat.completions.create(
				model=self.bot_doc.model, messages=[{"role": "user", "content": "test"}], max_tokens=5
			)
			if not test_response or not test_response.choices:
				return False
			return True
		except Exception as e:
			frappe.log_error(
				f"API connection test error:\n"
				f"Error: {str(e)}\n"
				f"Model: {self.bot_doc.model}\n"
				f"Provider: {self.bot_doc.model_provider}\n"
				f"API URL: {self.settings.local_llm_api_url if self.bot_doc.model_provider == 'Local LLM' else 'OpenAI'}",
				"API Connection Error",
			)
			return False

	def _setup_tools(self):
		"""Create SDK Tools from existing functions"""
		self.tools = []

		try:
			from raven.ai.sdk_tools import create_raven_tools

			raven_tools = create_raven_tools(self.bot_doc)
			if raven_tools:
				self.tools.extend(raven_tools)
		except Exception as e:
			frappe.log_error(
				f"Error loading Raven AI Functions: {str(e)}\n{traceback.format_exc()}",
				"Raven AI Functions Error",
			)

		# Add file search tool if enabled for OpenAI
		if (
			hasattr(self.bot_doc, "enable_file_search")
			and self.bot_doc.enable_file_search
			and self.bot_doc.model_provider == "OpenAI"
		):
			try:
				# For OpenAI, we need to handle file search differently
				# The SDK doesn't have a built-in FileSearchTool yet
				# We'll create a custom tool that can access uploaded files
				file_search_tool = self._create_file_search_tool()
				if file_search_tool:
					self.tools.append(file_search_tool)
			except Exception as e:
				frappe.log_error(
					f"Error creating file search tool: {str(e)}\n{traceback.format_exc()}",
					"File Search Tool Error",
				)

		# Add Code Interpreter tool if enabled
		if hasattr(self.bot_doc, "enable_code_interpreter") and self.bot_doc.enable_code_interpreter:
			try:
				# Create CodeInterpreterTool with proper configuration
				code_interpreter_tool = CodeInterpreterTool(
					tool_config={"type": "code_interpreter", "container": {"type": "auto"}}
				)

				self.tools.append(code_interpreter_tool)
			except Exception as e:
				frappe.log_error(
					f"Error adding Code Interpreter: {str(e)}\n{traceback.format_exc()}", "Code Interpreter Error"
				)

		if self.file_handler and self.file_handler.conversation_files:
			conversation_file_tool = self.file_handler.create_file_analysis_tool()
			if conversation_file_tool:
				self.tools.append(conversation_file_tool)

	def _create_crud_tools(self) -> list[Tool]:
		"""Wrap CRUD functions as OpenAI Agents Tools"""

		tools = []

		# Tool for get_document
		@function_tool
		def get_document_tool(doctype: str, document_id: str) -> dict:
			"""Get a single document with permissions check

			Args:
			    doctype: The DocType name
			    document_id: The document ID
			"""
			return get_document(doctype, document_id)

		# Tool for create_document
		@function_tool
		def create_document_tool(doctype: str, data: dict) -> dict:
			"""Create a new document in the database

			Args:
			    doctype: The DocType name
			    data: Document data as dictionary
			"""
			# Pass bot function if exists
			function = self._get_bot_function(doctype)
			return create_document(doctype, data, function)

		# Tool for update_document
		@function_tool
		def update_document_tool(doctype: str, document_id: str, data: dict) -> dict:
			"""Update a document in the database

			Args:
			    doctype: The DocType name
			    document_id: The document ID
			    data: Fields to update
			"""
			function = self._get_bot_function(doctype)
			return update_document(doctype, document_id, data, function)

		# Tool for delete_document
		@function_tool
		def delete_document_tool(doctype: str, document_id: str) -> dict:
			"""Delete a document from the database

			Args:
			    doctype: The DocType name
			    document_id: The document ID
			"""
			return delete_document(doctype, document_id)

		# Tool for get_list
		@function_tool
		def search_documents(
			doctype: str, filters: dict | None = None, fields: list[str] | None = None, limit: int = 20
		) -> list[dict]:
			"""Search documents in the database

			Args:
			    doctype: The DocType name
			    filters: Optional filters dictionary
			    fields: Optional list of fields to return
			    limit: Maximum number of results
			"""
			return get_list(doctype, filters, fields, limit)

		# Tool for submit_document
		@function_tool
		def submit_document_tool(doctype: str, document_id: str) -> dict:
			"""Submit a document (for submittable DocTypes)

			Args:
			    doctype: The DocType name
			    document_id: The document ID
			"""
			return submit_document(doctype, document_id)

		# Tool for cancel_document
		@function_tool
		def cancel_document_tool(doctype: str, document_id: str) -> dict:
			"""Cancel a submitted document

			Args:
			    doctype: The DocType name
			    document_id: The document ID
			"""
			return cancel_document(doctype, document_id)

		tools.extend(
			[
				get_document_tool,
				create_document_tool,
				update_document_tool,
				delete_document_tool,
				search_documents,
				submit_document_tool,
				cancel_document_tool,
			]
		)

		return tools

	def _create_file_search_tool(self):
		"""Create a file search tool for OpenAI bots using SDK's FileSearchTool"""
		try:
			from agents import FileSearchTool

			# First check if bot has a vector store ID directly stored
			vector_store_ids = []

			# Check if bot has openai_vector_store_id field
			if hasattr(self.bot_doc, "openai_vector_store_id") and self.bot_doc.openai_vector_store_id:
				vector_store_ids = [self.bot_doc.openai_vector_store_id]

			# If not found on bot, check the assistant
			elif hasattr(self.bot_doc, "openai_assistant_id") and self.bot_doc.openai_assistant_id:
				try:
					# Create a synchronous client for assistant operations
					from openai import OpenAI

					api_key = self.settings.get_password("openai_api_key")
					sync_client = OpenAI(
						api_key=api_key,
						organization=self.settings.openai_organisation_id,
						project=self.settings.openai_project_id if self.settings.openai_project_id else None,
					)

					assistant = sync_client.beta.assistants.retrieve(self.bot_doc.openai_assistant_id)

					# Check if assistant has vector store IDs in tool_resources
					if hasattr(assistant, "tool_resources") and assistant.tool_resources:
						# Access the vector store IDs
						file_search = getattr(assistant.tool_resources, "file_search", None)
						if file_search and hasattr(file_search, "vector_store_ids"):
							vs_ids = file_search.vector_store_ids
							if vs_ids:
								vector_store_ids = vs_ids

				except Exception as e:
					frappe.log_error(
						f"Error retrieving assistant: {str(e)}\n{traceback.format_exc()}", "File Search Tool Error"
					)

			# If still no vector store, log and return None
			if not vector_store_ids:
				return None

			file_search_tool = FileSearchTool(
				vector_store_ids=vector_store_ids,
				max_num_results=5,
				include_search_results=True,  # Include the actual search results
			)

			return file_search_tool

		except ImportError:
			return None
		except Exception as e:
			frappe.log_error(f"Error creating FileSearchTool: {str(e)}", "File Search Tool Error")
			return None

	def _get_bot_function(self, doctype: str):
		"""Get bot function configuration for a DocType"""
		for func in self.bot_doc.bot_functions:
			if func.linked_doctype == doctype:
				return func
		return None

	def create_agent(self) -> Agent:
		"""Create main agent with bot configuration"""

		# Validate model configuration
		if not self.bot_doc.model:
			frappe.throw(_("Bot model is not configured"))

		# Dynamic instructions if needed
		instructions = self.bot_doc.instruction
		if self.bot_doc.dynamic_instructions:
			# Replace Jinja variables
			from jinja2 import Template

			template = Template(instructions)
			instructions = template.render(
				user=frappe.session.user,
				company=frappe.defaults.get_user_default("company"),
				# Add other contextual variables
			)

		# Enhance instructions with tool information if tools are available
		if self.tools:
			tool_descriptions = []
			for tool in self.tools:
				# Handle different tool types
				if hasattr(tool, "description"):
					tool_descriptions.append(f"- {tool.name}: {tool.description}")
				elif isinstance(tool, CodeInterpreterTool):
					tool_descriptions.append(
						"- code_interpreter: Execute Python code to analyze data, process files, and perform calculations"
					)
				else:
					tool_descriptions.append(f"- {tool.name}: {type(tool).__name__}")

			tools_instruction = f"""

You have access to the following tools/functions that you can use to help answer questions:

{chr(10).join(tool_descriptions)}

CRITICAL INSTRUCTIONS FOR TOOL USE:
1. When a user asks for information that these tools can provide, use the appropriate tool IMMEDIATELY.
2. When asked to "improve", "enhance", or "update" something, PROPOSE A SPECIFIC SOLUTION FIRST, then apply it when the user confirms.
3. When the user confirms with words like "ok", "yes", "apply", "do it", "applique cela", etc., USE THE APPROPRIATE TOOL to make the change.
4. Do NOT ask the user to provide information that you can generate or retrieve yourself.
5. Always read function descriptions carefully and follow any workflow instructions they contain.
6. IMPORTANT: If a user asks about files they uploaded (PDFs, invoices, documents), you MUST use the 'analyze_conversation_file' tool. Never say you cannot analyze files - you have the tool to do it!
7. For questions about invoice amounts, document content, or file information, ALWAYS use 'analyze_conversation_file' with an appropriate query."""

			instructions = instructions + tools_instruction

		# Create model settings
		model_settings = ModelSettings(temperature=self.bot_doc.temperature, top_p=self.bot_doc.top_p)

		# Add reasoning_effort if available (for o-series models)
		if hasattr(self.bot_doc, "reasoning_effort") and self.bot_doc.reasoning_effort:
			model_settings.reasoning_effort = self.bot_doc.reasoning_effort

		# Create agent - ALWAYS pass empty list instead of None for tools
		agent = Agent(
			name=self.bot_doc.bot_name,
			instructions=instructions,
			model=self.bot_doc.model,
			tools=self.tools if self.tools else [],  # Pass empty list, not None
			model_settings=model_settings,
		)

		# Ensure tools is always a list on the agent object
		if not hasattr(agent, "tools") or agent.tools is None:
			agent.tools = []

		return agent


# Async handler function that can be called from sync context
async def handle_ai_request_async(
	bot, message: str, channel_id: str, conversation_history: list = None, file_handler=None
):
	"""Handle AI request asynchronously"""
	try:

		manager = RavenAgentManager(bot, file_handler=file_handler)

		# Test API connection first
		if not await manager._test_api_connection():
			return {
				"response": "I'm having trouble connecting to the AI service. Please check the configuration and try again.",
				"success": False,
				"error": "API connection failed",
			}

		agent = manager.create_agent()

		if not agent:
			return {
				"response": "Failed to create AI agent.",
				"success": False,
				"error": "Agent creation failed",
			}

		# Build conversation context
		# If there are files in the conversation, always suggest to use them
		has_files_in_conversation = manager.file_handler and manager.file_handler.conversation_files

		# If files are present in the conversation, enhance the message
		if has_files_in_conversation:
			# Get file names - but only mention the most recent one if it's the only one
			files = list(manager.file_handler.conversation_files.values())
			if len(files) == 1:
				# Only one file - be specific
				file_name = files[0]["file_name"]
				message = f"{message}\n\n[IMPORTANT: The user has uploaded the file '{file_name}'. You MUST use the 'analyze_conversation_file' tool to read and analyze THIS specific file before answering. The user is asking about the content of this file.]"
			else:
				# Multiple files - let the AI figure out which one based on context
				file_names = [f["file_name"] for f in files]
				message = f"{message}\n\n[IMPORTANT: The user has uploaded files in this conversation. Available files: {', '.join(file_names)}. Use the 'analyze_conversation_file' tool to analyze the relevant file(s) based on the user's question.]"

		# Don't include conversation history in the input if there are files
		# This prevents confusion from previous "I can't access files" responses
		if has_files_in_conversation:
			full_input = message
		else:
			full_input = message
			if conversation_history:
				# Only include the last few messages to avoid confusion
				recent_history = (
					conversation_history[-3:] if len(conversation_history) > 3 else conversation_history
				)
				context_messages = []
				for msg in recent_history:
					role = "Assistant" if msg["role"] == "assistant" else "User"
					# Truncate long messages
					content = msg["content"][:200] + "..." if len(msg["content"]) > 200 else msg["content"]
					context_messages.append(f"{role}: {content}")
				full_input = "\n\n".join(context_messages) + f"\n\nUser: {message}"

		# Context for the agent
		context = {
			"user": frappe.session.user,
			"channel": channel_id,
			"bot_name": bot.name,
			"company": frappe.defaults.get_user_default("company"),
			"conversation_history": conversation_history or [],
		}

		try:
			# Use Runner.run as a static method (not an instance)
			# Set max_turns to prevent infinite loops
			result = await Runner.run(agent, full_input, max_turns=5)

		except TypeError as te:
			if "NoneType" in str(te) and "not iterable" in str(te):

				# Try direct API call as fallback
				try:
					# For direct API calls, we need to manually add tool definitions
					# if the bot has tools configured
					tools_param = None
					if manager.tools:
						tools_param = []
						for tool in manager.tools:
							# Skip non-FunctionTool tools (like CodeInterpreterTool)
							# as they can't be converted to OpenAI function format
							if hasattr(tool, "description") and hasattr(tool, "params_json_schema"):
								# Convert FunctionTool to OpenAI function format
								tool_def = {
									"type": "function",
									"function": {
										"name": tool.name,
										"description": tool.description,
										"parameters": tool.params_json_schema,
									},
								}
								tools_param.append(tool_def)

					# Add instruction to encourage immediate tool use
					enhanced_instructions = (
						agent.instructions
						+ "\n\nIMPORTANT: When asked to perform an action, use your tools immediately. Do not overthink. Keep responses brief and action-oriented. When asked to improve something, propose a specific solution immediately. If asked about file content, invoices, or documents, ALWAYS use the analyze_conversation_file tool - never say you cannot analyze files."
					)

					# Build messages array with proper conversation history
					messages = [{"role": "system", "content": enhanced_instructions}]

					# Add conversation history as separate messages
					if conversation_history:
						for msg in conversation_history:
							messages.append({"role": msg["role"], "content": msg["content"]})

					# Add current user message
					messages.append({"role": "user", "content": message})

					# Create the API call with or without tools
					api_params = {
						"model": bot.model,
						"messages": messages,
						"temperature": agent.model_settings.temperature,
						"top_p": agent.model_settings.top_p,
						"max_tokens": 800,  # Reduced to avoid truncation and encourage conciseness
					}

					# Add tools if available
					if tools_param:
						api_params["tools"] = tools_param
						api_params["tool_choice"] = "auto"

					response = await manager.client.chat.completions.create(**api_params)

					if response and response.choices:
						choice = response.choices[0]

						# Check if the response contains tool calls
						if hasattr(choice.message, "tool_calls") and choice.message.tool_calls:
							# Execute tool calls
							tool_results = []
							for tool_call in choice.message.tool_calls:
								tool_name = tool_call.function.name
								tool_args = tool_call.function.arguments

								# Truncate args for title to avoid length error
								args_preview = tool_args[:50] + "..." if len(tool_args) > 50 else tool_args

								# Find the tool in manager.tools
								tool_result = None
								for tool in manager.tools:
									if tool.name == tool_name:
										# Execute the tool
										tool_result = await tool.on_invoke_tool(None, tool_args)
										break

								if tool_result:
									tool_results.append({"tool_call_id": tool_call.id, "output": tool_result})

							# If we have tool results, make another API call with the results
							if tool_results:
								# Add assistant message with tool calls
								messages = [
									{"role": "system", "content": agent.instructions},
									{"role": "user", "content": full_input},
									choice.message.model_dump(),
								]

								# Add tool results
								for result in tool_results:
									messages.append(
										{"role": "tool", "content": result["output"], "tool_call_id": result["tool_call_id"]}
									)

								# Make final API call
								final_response = await manager.client.chat.completions.create(
									model=bot.model,
									messages=messages,
									temperature=agent.model_settings.temperature,
									top_p=agent.model_settings.top_p,
									max_tokens=2000,
								)

								if final_response and final_response.choices:
									raw_response = final_response.choices[0].message.content
								else:
									raw_response = "Failed to get final response after tool execution."
							else:
								raw_response = "Tool execution failed - no results obtained."
						else:
							# No tool calls, just a regular response
							raw_response = choice.message.content

						# Format the response
						from raven.ai.response_formatter import format_ai_response

						formatted_response = (
							format_ai_response(raw_response) if raw_response else "No response content."
						)

						result = type("Result", (), {"final_output": formatted_response})()
					else:
						raise Exception("No response from API")

				except Exception as api_e:
					import traceback as tb

					frappe.log_error(
						f"Direct API call also failed:\n{str(api_e)}\n\nTraceback:\n{tb.format_exc()}",
						"API Fallback Error",
					)
					raise
			else:
				raise

		# Format the response if not already formatted
		from raven.ai.response_formatter import format_ai_response

		final_response = result.final_output

		# Check if response needs formatting (contains think tags or boxed notation)
		if "<think>" in final_response or "\\boxed{" in final_response:
			final_response = format_ai_response(final_response)

		return {
			"response": final_response,
			"success": True,
			"provider": bot.model_provider if hasattr(bot, "model_provider") else "OpenAI",
		}

	except Exception as e:
		import traceback

		error_details = traceback.format_exc()
		frappe.log_error(f"AI Agent Error: {str(e)}\n\nTraceback:\n{error_details}", "Raven AI")

		return {
			"response": "I encountered an error while processing your request.",
			"success": False,
			"error": str(e) if bot.debug_mode else None,
		}


def handle_ai_request_sync(
	bot, message: str, channel_id: str, conversation_history: list = None, file_handler=None
):
	"""Synchronous wrapper for async AI request handling"""
	loop = asyncio.new_event_loop()
	asyncio.set_event_loop(loop)
	try:
		return loop.run_until_complete(
			handle_ai_request_async(bot, message, channel_id, conversation_history, file_handler)
		)
	finally:
		loop.close()
