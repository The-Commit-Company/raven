import frappe

from raven.ai.handler import get_variables_for_instructions


@frappe.whitelist()
def get_instruction_preview(instruction):
	"""
	Function to get the rendered instructions for the bot
	"""
	instructions = frappe.render_template(instruction, get_variables_for_instructions())
	return instructions
