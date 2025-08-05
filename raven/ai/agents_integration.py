"""
Improved agents integration with better import handling based on Desktop Raven approach.
"""

import asyncio
import json
import re
import traceback

import frappe
import openai

# Import agents SDK - the package is called 'agents' not 'openai_agents'
from agents import (
	Agent,
	CodeInterpreterTool,
	ComputerTool,
	FileSearchTool,
	HostedMCPTool,
	ImageGenerationTool,
	LocalShellTool,
	ModelSettings,
	OpenAIProvider,
	Runner,
	Tool,
	WebSearchTool,
	function_tool,
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


async def _handle_local_llm_request(manager, agent, full_input, bot):
	"""
	Custom handler for Local LLMs that don't support native function calling.
	This implements a text-based tool calling mechanism.
	"""

	try:
		# Build messages for the API call
		messages = [{"role": "system", "content": agent.instructions}]

		# Add conversation history
		if isinstance(full_input, list):
			messages.extend(full_input)
		else:
			messages.append({"role": "user", "content": full_input})

		# Make the initial API call
		response = await manager.client.chat.completions.create(
			model=bot.model,
			messages=messages,
			temperature=agent.model_settings.temperature,
			top_p=agent.model_settings.top_p,
			max_tokens=4096,
			# Don't include tools parameter for Local LLM
		)

		if not response or not response.choices:
			return {
				"response": "Failed to get response from Local LLM.",
				"success": False,
				"error": "No response from API",
			}

		# Extract the response
		choice = response.choices[0]
		raw_response = None

		# Try different fields where the content might be
		if hasattr(choice, "message") and choice.message:
			if hasattr(choice.message, "content") and choice.message.content:
				raw_response = choice.message.content
			elif hasattr(choice.message, "text"):
				raw_response = choice.message.text
		elif hasattr(choice, "text"):
			raw_response = choice.text

		if not raw_response:
			raw_response = ""
		else:
			# Convert HTML entities to their actual characters
			import html

			raw_response = html.unescape(raw_response)

		# Now handle tool calls in the response
		max_iterations = 10  # Increased to handle LLMs that retry with wrong parameters
		iteration = 0
		current_messages = messages.copy()

		while iteration < max_iterations and raw_response:
			# Check if response contains tool calls
			has_tool_call = "<tool_call>" in raw_response and "</tool_call>" in raw_response

			if has_tool_call:
				# Extract and execute tool call
				tool_call_match = re.search(r"<tool_call>\s*({.*?})\s*</tool_call>", raw_response, re.DOTALL)

				if tool_call_match:
					try:
						tool_call_data = json.loads(tool_call_match.group(1))
						tool_name = tool_call_data.get("name")
						tool_args = json.dumps(tool_call_data.get("arguments", {}))

						# Find available tools

						# Find and execute the tool
						tool_result = None
						tool_found = False
						for tool in manager.tools:
							if tool.name == tool_name:
								tool_found = True
								try:
									tool_result = await tool.on_invoke_tool(None, tool_args)
								except Exception as e:
									tool_result = f"Error executing tool: {str(e)}"
								break

						if not tool_found:
							pass

						if not tool_result:
							tool_result = f"Tool '{tool_name}' not found or returned no result"

						# Add the exchange to messages
						current_messages.append({"role": "assistant", "content": raw_response})
						tool_result_msg = f"Tool result for {tool_name}: {tool_result}"
						current_messages.append({"role": "user", "content": tool_result_msg})

						# Make another API call with the tool result
						follow_up = await manager.client.chat.completions.create(
							model=bot.model,
							messages=current_messages,
							temperature=agent.model_settings.temperature,
							top_p=agent.model_settings.top_p,
							max_tokens=2000,
						)

						if follow_up and follow_up.choices:
							choice = follow_up.choices[0]
							if hasattr(choice, "message") and choice.message and choice.message.content:
								raw_response = choice.message.content
							else:
								raw_response = ""
						else:
							break

					except json.JSONDecodeError:
						break
					except Exception as e:
						break
				else:
					# No more tool calls found
					break
			else:
				# No tool calls in response
				break

			iteration += 1

		# Format the final response
		from raven.ai.response_formatter import format_ai_response

		formatted_response = format_ai_response(raw_response) if raw_response else "No response content."

		return {"response": formatted_response, "success": True, "provider": "Local LLM"}

	except Exception as e:
		return {
			"response": "Error processing request with Local LLM.",
			"success": False,
			"error": str(e),
		}


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

			# Create provider with use_responses=False for LM Studio
			self.provider = OpenAIProvider(
				openai_client=client, use_responses=False  # Force chat/completions endpoint usage
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

			# Create provider with use_responses=True for OpenAI
			self.provider = OpenAIProvider(
				openai_client=client, use_responses=True  # Use /v1/responses for OpenAI
			)

		# Keep client reference for backward compatibility
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
			pass
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
			pass

		# Add CRUD tools
		crud_tools = self._create_crud_tools()
		if crud_tools:
			self.tools.extend(crud_tools)

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
				pass

		# Add Code Interpreter tool if enabled (only for OpenAI, not supported with Local LLM)
		if (
			hasattr(self.bot_doc, "enable_code_interpreter")
			and self.bot_doc.enable_code_interpreter
			and self.bot_doc.model_provider == "OpenAI"
		):
			try:
				# Create CodeInterpreterTool with proper configuration
				code_interpreter_tool = CodeInterpreterTool(
					tool_config={"type": "code_interpreter", "container": {"type": "auto"}}
				)

				self.tools.append(code_interpreter_tool)
			except Exception as e:
				pass

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
					pass

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
			return None

	def _get_bot_function(self, doctype: str):
		"""Get bot function configuration for a DocType"""
		for func in self.bot_doc.bot_functions:
			if func.linked_doctype == doctype:
				return func
		return None

	def _filter_tools_for_provider(self) -> list[Tool]:
		"""Filter tools based on the provider capabilities"""
		if self.bot_doc.model_provider == "Local LLM":
			# Filter out hosted tools that are not supported with ChatCompletions API
			filtered_tools = []
			hosted_tool_types = (
				CodeInterpreterTool,
				FileSearchTool,
				WebSearchTool,
				ComputerTool,
				HostedMCPTool,
				ImageGenerationTool,
				LocalShellTool,
			)

			for tool in self.tools:
				if isinstance(tool, hosted_tool_types):
					pass
				else:
					filtered_tools.append(tool)

			return filtered_tools
		else:
			# For OpenAI, all tools are supported
			return self.tools

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
7. For questions about invoice amounts, document content, or file information, ALWAYS use 'analyze_conversation_file' with an appropriate query.

IMPORTANT: When calling tools, you have two options:
1. **Preferred**: Let the SDK handle tool execution automatically through native function calling
2. **Fallback**: If native function calling is not supported, use this exact format:
   <tool_call>
   {{
     "name": "function_name",
     "arguments": {{
       "param1": "value1",
       "param2": "value2"
     }}
   }}
   </tool_call>

For functions with no parameters, use empty arguments: {{"name": "function_name", "arguments": {{}}}}"""

			instructions = instructions + tools_instruction

		# Create model settings
		model_settings = ModelSettings(temperature=self.bot_doc.temperature, top_p=self.bot_doc.top_p)

		# Add reasoning_effort if available (for o-series models)
		if hasattr(self.bot_doc, "reasoning_effort") and self.bot_doc.reasoning_effort:
			model_settings.reasoning_effort = self.bot_doc.reasoning_effort

		# Create agent - ALWAYS pass empty list instead of None for tools
		# Get the model from the provider
		model = self.provider.get_model(self.bot_doc.model)

		# Filter tools based on provider capabilities
		filtered_tools = self._filter_tools_for_provider()

		agent = Agent(
			name=self.bot_doc.bot_name,
			instructions=instructions,
			model=model,  # Pass the model object from provider
			tools=filtered_tools if filtered_tools else [],  # Pass empty list, not None
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

		# No need to test API connection anymore - the SDK will handle errors
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

		# Build input with proper conversation history format
		if conversation_history:
			# Convert conversation history to proper format for the SDK
			input_items = []

			# Add conversation history as separate items
			for msg in conversation_history:
				# Clean HTML and extract plain text content
				content = msg["content"]

				# Remove HTML details/summary tags for reasoning
				if "<details" in content and "</details>" in content:
					# Extract the main response after the details section
					# Remove the entire details block
					content = re.sub(r"<details.*?</details>", "", content, flags=re.DOTALL).strip()

				# Skip empty messages
				if not content:
					continue

				if msg["role"] == "user":
					input_items.append({"role": "user", "content": content})  # Use "role" not "type"
				elif msg["role"] == "assistant":
					input_items.append({"role": "assistant", "content": content})  # Use "role" not "type"

			# Add current message
			current_msg = {"role": "user", "content": message}

			# Add file context if present
			if has_files_in_conversation:
				files = list(manager.file_handler.conversation_files.values())
				if len(files) == 1:
					file_name = files[0]["file_name"]
					current_msg[
						"content"
					] = f"{message}\n\n[IMPORTANT: The user has uploaded the file '{file_name}'. You MUST use the 'analyze_conversation_file' tool to read and analyze THIS specific file before answering.]"
				else:
					file_names = [f["file_name"] for f in files]
					current_msg[
						"content"
					] = f"{message}\n\n[IMPORTANT: The user has uploaded files in this conversation. Available files: {', '.join(file_names)}. Use the 'analyze_conversation_file' tool to analyze the relevant file(s) based on the user's question.]"

			input_items.append(current_msg)
			full_input = input_items
		else:
			# No history, just the current message
			if has_files_in_conversation:
				files = list(manager.file_handler.conversation_files.values())
				if len(files) == 1:
					file_name = files[0]["file_name"]
					message = f"{message}\n\n[IMPORTANT: The user has uploaded the file '{file_name}'. You MUST use the 'analyze_conversation_file' tool to read and analyze THIS specific file before answering.]"
				else:
					file_names = [f["file_name"] for f in files]
					message = f"{message}\n\n[IMPORTANT: The user has uploaded files in this conversation. Available files: {', '.join(file_names)}. Use the 'analyze_conversation_file' tool to analyze the relevant file(s) based on the user's question.]"

			full_input = message

		try:
			# For Local LLM, we need to use our custom implementation
			# The SDK doesn't have a fallback for models without native function calling
			if bot.model_provider == "Local LLM":
				# Use our custom implementation that handles text-based tool calls
				return await _handle_local_llm_request(manager, agent, full_input, bot)

			# Use Runner.run as a static method (not an instance)
			# Set max_turns to prevent infinite loops
			result = await Runner.run(agent, full_input, max_turns=5)

		except (TypeError, openai.NotFoundError) as e:
			# Handle both TypeError and NotFoundError (404) with fallback
			should_fallback = False

			if isinstance(e, TypeError) and "NoneType" in str(e) and "not iterable" in str(e):
				should_fallback = True
			elif isinstance(e, TypeError) and "Force fallback for Local LLM" in str(e):
				# Forced fallback for Local LLM to handle custom tool calls
				should_fallback = True
			elif isinstance(e, openai.NotFoundError):
				# 404 errors indicate the endpoint is not supported (like agents SDK endpoints on Ollama)
				should_fallback = True

			if should_fallback:
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
					tool_use_reminder = "\n\nIMPORTANT: When asked to perform an action, use your tools immediately. Do not overthink. Keep responses brief and action-oriented. When asked to improve something, propose a specific solution immediately. If asked about file content, invoices, or documents, ALWAYS use the analyze_conversation_file tool - never say you cannot analyze files."

					# For Local LLMs, we need to be more explicit about tool usage
					if bot.model_provider == "Local LLM":
						tool_use_reminder += "\n\nREMEMBER: You MUST use the <tool_call> format when calling functions. Do not just describe what you would do - actually call the function using the exact format shown in your instructions."

					enhanced_instructions = agent.instructions + tool_use_reminder

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
						"max_tokens": 4096,  # Sufficient for reasoning and tool calls
					}

					# Add tools if available
					# For Local LLM, we might not want to include tools in the API params
					# as they might not support the OpenAI tool format
					if tools_param and bot.model_provider != "Local LLM":
						api_params["tools"] = tools_param
						api_params["tool_choice"] = "auto"

					response = await manager.client.chat.completions.create(**api_params)

					if response and response.choices:
						choice = response.choices[0]
						# Handle different response formats for Local LLMs
						if hasattr(choice, "message") and choice.message and hasattr(choice.message, "content"):
							raw_response = choice.message.content
							# Special handling for empty content - check if it's actually None or empty string
							if raw_response == "" and bot.model_provider == "Local LLM":
								pass
						elif hasattr(choice, "text"):
							# Some Local LLMs return response in choice.text
							raw_response = choice.text
						elif hasattr(choice, "delta") and hasattr(choice.delta, "content"):
							# Some LLMs use delta for streaming-style responses
							raw_response = choice.delta.content
						else:
							# Try to extract content from any available field
							raw_response = None

						# Check if the response contains tool calls
						if (
							hasattr(choice, "message")
							and choice.message
							and hasattr(choice.message, "tool_calls")
							and choice.message.tool_calls
						):
							# Execute tool calls
							tool_results = []
							for tool_call in choice.message.tool_calls:
								tool_name = tool_call.function.name
								tool_args = tool_call.function.arguments

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
							# No native tool calls, check if raw_response is set
							if not raw_response:
								pass

							# Handle multiple tool calls in sequence
							max_tool_calls = 5  # Prevent infinite loops
							tool_call_count = 0
							conversation_messages = messages.copy()  # Use existing messages

							while (
								raw_response
								and "<tool_call>" in raw_response
								and "</tool_call>" in raw_response
								and tool_call_count < max_tool_calls
							):
								# Extract tool call from response
								tool_call_match = re.search(
									r"<tool_call>\s*({.*?})\s*</tool_call>", raw_response, re.DOTALL
								)

								if tool_call_match:
									try:
										# Parse the tool call
										tool_call_data = json.loads(tool_call_match.group(1))
										tool_name = tool_call_data.get("name")
										tool_args = json.dumps(tool_call_data.get("arguments", {}))

										# Find and execute the tool
										tool_result = None
										tool_found = False
										for tool in manager.tools:
											if tool.name == tool_name:
												tool_found = True
												# Execute the tool
												try:
													tool_result = await tool.on_invoke_tool(None, tool_args)
												except Exception as e:
													tool_result = f"Error executing tool: {str(e)}"
												break

										# Always make a second API call to generate proper response
										if not tool_found:
											tool_result = f"Tool '{tool_name}' not found"

										# Add the assistant's message with tool call to conversation
										conversation_messages.append({"role": "assistant", "content": raw_response})

										# Add tool result to conversation
										conversation_messages.append(
											{
												"role": "tool",
												"content": tool_result or "Tool executed successfully",
												"tool_call_id": f"custom_tool_call_{tool_call_count}",
											}
										)

										# Make API call to continue the conversation
										follow_up_response = await manager.client.chat.completions.create(
											model=bot.model,
											messages=conversation_messages,
											temperature=agent.model_settings.temperature,
											top_p=agent.model_settings.top_p,
											max_tokens=2000,
										)

										if follow_up_response and follow_up_response.choices:
											raw_response = follow_up_response.choices[0].message.content
											tool_call_count += 1
										else:
											raw_response = "Function executed but could not generate a response."
											break

									except json.JSONDecodeError as e:
										break
									except Exception as e:
										break
								else:
									# No valid tool call found, exit loop
									break

						# Format the response
						from raven.ai.response_formatter import format_ai_response

						# Log the raw response

						formatted_response = (
							format_ai_response(raw_response) if raw_response else "No response content."
						)

						result = type("Result", (), {"final_output": formatted_response})()
					else:
						# No response or no choices
						raw_response = None

					# If we still don't have a result, create one with error message
					if "result" not in locals():
						result = type("Result", (), {"final_output": "Failed to get response from API"})()

				except Exception as api_e:
					# Create error result instead of raising
					result = type("Result", (), {"final_output": f"Error: {str(api_e)}"})()
					# Don't raise, continue with error result
			else:
				raise

		# Format the response if not already formatted
		from raven.ai.response_formatter import format_ai_response

		final_response = result.final_output

		# Check if response needs formatting (contains think tags or boxed notation)
		if "<think>" in final_response or "\\boxed{" in final_response:
			final_response = format_ai_response(final_response)

		# IMPORTANT: Check if the response contains unexecuted tool calls
		# This can happen if the SDK doesn't support native function calling
		if "<tool_call>" in final_response and "</tool_call>" in final_response:
			# The response contains tool calls that weren't executed
			# This means we need to handle them manually
			pass

		return {
			"response": final_response,
			"success": True,
			"provider": bot.model_provider if hasattr(bot, "model_provider") else "OpenAI",
		}

	except Exception as e:
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
