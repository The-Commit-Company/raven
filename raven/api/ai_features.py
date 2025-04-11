import frappe
import openai

from raven.ai.handler import get_variables_for_instructions


@frappe.whitelist()
def get_instruction_preview(instruction):
	"""
	Function to get the rendered instructions for the bot
	"""
	frappe.has_permission(doctype="Raven Bot", ptype="write", throw=True)

	instructions = frappe.render_template(instruction, get_variables_for_instructions())
	return instructions


@frappe.whitelist()
def get_saved_prompts(bot: str = None):
	"""
	API to get the saved prompt for a user/bot/global
	"""
	or_filters = [["is_global", "=", 1], ["owner", "=", frappe.session.user]]

	prompts = frappe.get_list(
		"Raven Bot AI Prompt", or_filters=or_filters, fields=["name", "prompt", "is_global", "raven_bot"]
	)

	# Order by ones with the given bot
	prompts = sorted(prompts, key=lambda x: x.get("raven_bot") == bot, reverse=True)

	return prompts


@frappe.whitelist()
def get_open_ai_version():
	"""
	API to get the version of the OpenAI Python client
	"""
	frappe.has_permission(doctype="Raven Bot", ptype="read", throw=True)
	return openai.__version__


@frappe.whitelist()
def get_openai_available_models():
	"""
	API to get the available OpenAI models for assistants
	"""
	frappe.has_permission(doctype="Raven Bot", ptype="read", throw=True)
	from raven.ai.openai_client import get_openai_models
	return get_openai_models()


@frappe.whitelist()
def get_model_supported_tools(model_id):
	"""
	API to check which tools are supported by a specific model
	
	Args:
		model_id (str): The OpenAI model ID to check
		
	Returns:
		dict: Information about which tools are supported by the model
	"""
	frappe.has_permission(doctype="Raven Bot", ptype="read", throw=True)
	
	try:
		from raven.ai.openai_client import get_open_ai_client
		
		client = get_open_ai_client()

		supports_code_interpreter = False
		supports_file_search = False
		supported_tools = []
		
		# Test code_interpreter
		try:
			temp_assistant = client.beta.assistants.create(
				model=model_id,
				name="Temp Code Interpreter Check",
				instructions="This is a temporary assistant for checking tool compatibility.",
				tools=[{"type": "code_interpreter"}]
			)
			
			# If we are here, the code_interpreter is supported
			if any(tool.type == "code_interpreter" for tool in temp_assistant.tools):
				supports_code_interpreter = True
				supported_tools.append("code_interpreter")
			
			# Delete the temporary assistant
			client.beta.assistants.delete(temp_assistant.id)
		except Exception as e:
			frappe.log_error("Tool Compatibility", f"Model {model_id} - code_interpreter check failed")
		
		# Tester file_search
		try:
			temp_assistant = client.beta.assistants.create(
				model=model_id,
				name="Temp File Search Check",
				instructions="This is a temporary assistant for checking tool compatibility.",
				tools=[{"type": "file_search"}]
			)
			
			# Si nous sommes ici, le file_search est supporté
			if any(tool.type == "file_search" for tool in temp_assistant.tools):
				supports_file_search = True
				supported_tools.append("file_search")
			
			# Supprimer l'assistant temporaire
			client.beta.assistants.delete(temp_assistant.id)
		except Exception as e:
			frappe.log_error("Tool Compatibility", f"Model {model_id} - file_search check failed")
		
		return {
			"model": model_id,
			"supported_tools": supported_tools,
			"supports_code_interpreter": supports_code_interpreter,
			"supports_file_search": supports_file_search
		}
	
	except Exception as e:	
		frappe.log_error("Tool Compatibility", f"Model compatibility check failed: {model_id}")
		
		# Determine the type of error by searching in the original string (before truncation)
		original_error = str(e).lower()
		
		# Return a response based on the error
		if "model_not_found" in original_error or "404" in original_error:
			return {
				"model": model_id,
				"error": "Model not found",
				"supported_tools": [],
				"supports_code_interpreter": False,
				"supports_file_search": False
			}
		elif "417" in original_error or "expectation failed" in original_error or "400" in original_error:
			# The 417/400 error may indicate that the model exists but there is a problem with the tools
			return {
				"model": model_id,
				"error": "Incompatible tools",
				"supported_tools": [],
				"supports_code_interpreter": False,
				"supports_file_search": False
			}
		
		# By default, assume that no tool is supported to be sure
		return {
			"model": model_id,
			"error": "Error checking compatibility",
			"supported_tools": [], 
			"supports_code_interpreter": False,
			"supports_file_search": False
		}
