import json

import frappe
from openai import AssistantEventHandler, OpenAI
from openai.types.beta.threads import Text, TextDelta
from typing_extensions import override

from raven.ai.openai_client import get_open_ai_client


def stream_response(ai_thread_id: str, bot, channel_id: str):

	client = get_open_ai_client()

	assistant_id = bot.openai_assistant_id

	class EventHandler(AssistantEventHandler):
		@override
		def on_text_done(self, text: Text):
			bot.send_message(channel_id=channel_id, text=text.value)

			print(client.beta.threads.runs.retrieve(thread_id=ai_thread_id, run_id=self.current_run.id))

		@override
		def on_event(self, event):
			# Retrieve events that are denoted with 'requires_action'
			# since these will have our tool_calls
			if event.event == "thread.run.requires_action":
				run_id = event.data.id  # Retrieve the run ID from the event data
				self.handle_requires_action(event.data, run_id)

		def handle_requires_action(self, data, run_id):
			tool_outputs = []

			for tool in data.required_action.submit_tool_outputs.tool_calls:

				args = json.loads(tool.function.arguments)

				function_output = {}

				function = None

				try:
					function = frappe.get_cached_doc("Raven AI Function", tool.function.name)
					function_path = function.function_path
				except frappe.DoesNotExistError:
					function_path = None

				if not function_path:
					tool_outputs.append({"tool_call_id": tool.id, "output": "Function not found"})

				function_name = frappe.get_attr(function_path)

				# When calling the function, we need to pass the arguments as named params/json
				# Args is a dictionary of the form {"param_name": "param_value"}

				if bot.allow_bot_to_write_documents:
					# We can commit to the database if writes are allowed
					if function.pass_parameters_as_json:
						function_output = function_name(args)
					else:
						function_output = function_name(**args)
				else:
					# We need to savepoint and then rollback
					frappe.db.savepoint(run_id + "_" + tool.id)
					if function.pass_parameters_as_json:
						function_output = function_name(args)
					else:
						function_output = function_name(**args)
					frappe.db.rollback(save_point=run_id + "_" + tool.id)

				tool_outputs.append(
					{"tool_call_id": tool.id, "output": json.dumps(function_output, default=str)}
				)

			# Submit all tool_outputs at the same time
			self.submit_tool_outputs(tool_outputs, run_id)

		def submit_tool_outputs(self, tool_outputs, run_id):
			# Use the submit_tool_outputs_stream helper
			with client.beta.threads.runs.submit_tool_outputs_stream(
				thread_id=self.current_run.thread_id,
				run_id=self.current_run.id,
				tool_outputs=tool_outputs,
				event_handler=EventHandler(),
			) as stream:
				for text in stream.text_deltas:
					print(text, end="", flush=True)
				print()

	# We need to get the instructions from the bot
	instructions = get_instructions(bot)
	with client.beta.threads.runs.stream(
		thread_id=ai_thread_id,
		assistant_id=assistant_id,
		event_handler=EventHandler(),
		instructions=instructions,
	) as stream:
		stream.until_done()


def get_instructions(bot):

	# If no instruction is set, or dynamic instruction is disabled, we return None
	if not bot.instruction or not bot.dynamic_instructions:
		return None

	vars = get_variables_for_instructions(bot)

	instructions = frappe.render_template(bot.instruction, vars)
	return instructions


def get_variables_for_instructions(bot):
	return {
		"user_first_name": "Nikhil",
		"company": "The Commit Company (Demo)",
		"employee_id": "HR-EMP-00001",
		"department": "Product - TCCD",
	}
