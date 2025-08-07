"""
Local LLM handler using direct HTTP calls for better compatibility with LM Studio
"""

import json

import frappe
import requests


def local_llm_handler(bot, message: str, channel_id: str, conversation_history: list = None):
	"""
	Fast handler using direct HTTP calls for better LM Studio compatibility.

	Handles both OpenAI and LM Studio APIs with automatic prompt simplification
	for long prompts to prevent hallucinations with quantized models.
	"""

	# Get settings
	settings = frappe.get_single("Raven Settings")
	is_lm_studio = bot.model_provider == "Local LLM" and settings.local_llm_provider == "LM Studio"

	try:
		# Setup API endpoint and headers
		if bot.model_provider == "Local LLM":
			if not settings.local_llm_api_url:
				return {"response": "Local LLM API URL not configured", "success": False}
			base_url = settings.local_llm_api_url
			headers = {"Content-Type": "application/json"}
		else:
			api_key = settings.get_password("openai_api_key")
			if not api_key:
				return {"response": "OpenAI API key not configured", "success": False}
			base_url = "https://api.openai.com/v1"
			headers = {"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}

		# Get functions from bot
		functions = []
		if hasattr(bot, "bot_functions") and bot.bot_functions:
			for func in bot.bot_functions[:10]:  # Limit to 10 functions
				try:
					function_doc = frappe.get_doc("Raven AI Function", func.function)

					# Get params
					params = {}
					if hasattr(function_doc, "get_params") and callable(function_doc.get_params):
						params = function_doc.get_params()
					elif hasattr(function_doc, "params") and function_doc.params:
						try:
							params = json.loads(function_doc.params)
						except (json.JSONDecodeError, ValueError):
							params = {}

					# Remove additionalProperties
					if "additionalProperties" in params:
						del params["additionalProperties"]

					# Create function definition
					func_def = {
						"name": function_doc.function_name,
						"description": function_doc.description,
						"parameters": params,
					}
					functions.append(func_def)

				except Exception as e:
					# Error loading function - skip this function
					pass

		# Build initial messages
		messages = []

		# Build system prompt
		system_prompt = ""

		# Check if bot has custom instructions
		if bot.instruction:
			# For LM Studio with Qwen model, simplify long prompts to avoid hallucinations
			if is_lm_studio and len(bot.instruction) > 1500:
				# Simplify long prompts for LM Studio to prevent hallucinations with Qwen models
				system_prompt = (
					bot.instruction[:1000]
					+ """
## FUNCTION CALLING RULES
When asked to perform actions or retrieve data:
1. Always use available functions
2. Never invent or hallucinate data
3. Call functions sequentially as needed"""
				)
			else:
				# Use full instructions if not too long
				system_prompt = bot.instruction

		# If no instructions, use a default
		if not system_prompt:
			system_prompt = """You are an intelligent AI assistant with access to business functions.

## CRITICAL RULES for function calling

When the user asks you to perform an action, follow these steps:

1. **Analyze the request**: Understand what needs to be done
2. **Call functions sequentially**: Some tasks require multiple function calls
3. **Use function results**: The result of one function may be needed for the next

### Important:
- Always check function descriptions for requirements
- Some functions require information from other functions first
- Continue calling functions until the task is complete
- When presenting lists or tables, use appropriate HTML formatting with <table class='table'>

You can call multiple functions in sequence. After each function call, I will provide the result, and you can then call the next function if needed."""

		messages.append({"role": "system", "content": system_prompt})

		# Add conversation history (last 20 messages only)
		if conversation_history:
			for msg in conversation_history[-20:]:
				messages.append(msg)

		# Add current message
		messages.append({"role": "user", "content": message})

		# Setup model name
		model_name = bot.model if bot.model else "local-model"
		if bot.model_provider == "Local LLM" and not bot.model:
			model_name = "local-model"

		# Maximum rounds for function calls
		max_rounds = 5  # Prevent infinite loops
		current_round = 0
		final_response = None
		all_function_results = []

		# Main loop for multiple rounds
		while current_round < max_rounds:
			current_round += 1

			# Prepare request data
			data = {
				"model": model_name,
				"messages": messages,
				"temperature": bot.temperature,
				"max_tokens": 4096,
			}

			# Add functions/tools based on provider
			if functions:
				if is_lm_studio:
					# LM Studio uses tools format
					tools = []
					for func in functions:
						tools.append({"type": "function", "function": func})
					data["tools"] = tools
				else:
					# Standard OpenAI format
					data["functions"] = functions

			# Make API call
			response = requests.post(
				f"{base_url}/chat/completions", headers=headers, json=data, timeout=120
			)
			response.raise_for_status()
			response_json = response.json()

			# Process response
			if "choices" not in response_json or len(response_json["choices"]) == 0:
				break

			choice = response_json["choices"][0]
			message_data = choice.get("message", {})

			# Extract function calls
			function_calls = []

			# Check for tool_calls (LM Studio format)
			if "tool_calls" in message_data and message_data["tool_calls"]:
				for tool_call in message_data["tool_calls"]:
					if tool_call.get("type") == "function":
						func_data = tool_call.get("function", {})
						func_name = func_data.get("name")
						try:
							args = json.loads(func_data.get("arguments", "{}"))
						except (json.JSONDecodeError, ValueError):
							args = {}
						function_calls.append({"name": func_name, "arguments": args, "id": tool_call.get("id")})

			# Check for function_call (OpenAI format)
			elif "function_call" in message_data and message_data["function_call"]:
				func_call = message_data["function_call"]
				func_name = func_call.get("name")
				try:
					args = json.loads(func_call.get("arguments", "{}"))
				except (json.JSONDecodeError, ValueError):
					args = {}
				function_calls.append({"name": func_name, "arguments": args})

			# Fallback: Check for text-based tool calls in content (for thinking models)
			elif (
				not function_calls and message_data.get("content") and "<tool_call>" in message_data["content"]
			):
				content = message_data["content"]

				# Extract tool call from content
				import re

				tool_call_match = re.search(r"<tool_call>\s*({.*?})\s*</tool_call>", content, re.DOTALL)
				if tool_call_match:
					try:
						tool_call_data = json.loads(tool_call_match.group(1))
						func_name = tool_call_data.get("name")
						args = tool_call_data.get("arguments", {})
						function_calls.append({"name": func_name, "arguments": args})
					except Exception as e:
						pass

			# If we have function calls, execute them
			if function_calls:
				# Add assistant message to conversation
				messages.append(message_data)

				# Execute all function calls
				for func_call in function_calls:
					func_name = func_call["name"]
					args = func_call.get("arguments", {})

					result = execute_raven_function(func_name, args)

					# Store result
					all_function_results.append({"function": func_name, "arguments": args, "result": result})

					# Add result to messages
					if is_lm_studio:
						# LM Studio doesn't support function role, use user messages
						result_msg = {
							"role": "user",
							"content": f"The result of {func_name} is: {json.dumps(result, default=str)}",
						}
						messages.append(result_msg)
					else:
						# OpenAI format
						messages.append(
							{"role": "function", "name": func_name, "content": json.dumps(result, default=str)}
						)

				# Continue to next round to get the formatted response
				continue
			else:
				# No function calls - we have our final response
				content = message_data.get("content", "")
				final_response = content
				break

		# Format the final response
		if final_response:
			from raven.ai.response_formatter import format_ai_response

			final_response = format_ai_response(final_response)
		else:
			# No response received
			final_response = None

		return {"response": final_response, "success": True, "function_calls": all_function_results}

	except Exception as e:
		frappe.log_error(f"Local LLM Handler Error: {str(e)}", "Local LLM Handler")
		return {"response": f"Error: {str(e)}", "success": False}


def execute_raven_function(function_name: str, args: dict):
	"""
	Execute a Raven function by name
	"""
	try:
		# Special handling for get_current_context - use base function directly
		if function_name == "get_current_context":
			from raven.ai.functions import get_current_context

			return get_current_context()

		# Get the function document
		function_doc = frappe.get_doc("Raven AI Function", function_name)

		if function_doc.type == "Custom Function":
			# Execute custom function
			function_path = function_doc.function_path
			if function_path:
				func = frappe.get_attr(function_path)
				if func:
					result = func(**args)
					# Ensure result is JSON serializable
					if isinstance(result, dict):
						try:
							# Test serialization
							json.dumps(result, default=str)
						except (TypeError, ValueError):
							# Convert non-serializable values
							result = json.loads(json.dumps(result, default=str))
					return result

		# For other types, use existing handlers
		from raven.ai.functions import (
			create_document,
			delete_document,
			get_document,
			get_list,
			update_document,
		)

		if function_doc.type == "Get Document":
			return get_document(function_doc.reference_doctype, **args)
		elif function_doc.type == "Create Document":
			return create_document(function_doc.reference_doctype, data=args, function=function_doc)
		elif function_doc.type == "Update Document":
			return update_document(function_doc.reference_doctype, **args, function=function_doc)
		elif function_doc.type == "Delete Document":
			return delete_document(function_doc.reference_doctype, **args)
		elif function_doc.type == "Get List":
			return get_list(function_doc.reference_doctype, **args)

	except Exception as e:
		frappe.log_error(f"Function execution error: {str(e)}", f"Execute {function_name}")
		return {"error": str(e)}

	return {"error": "Function type not supported"}
