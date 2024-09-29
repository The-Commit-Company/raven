# Copyright (c) 2024, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import json

import frappe
from frappe import _, is_whitelisted
from frappe.model.document import Document


class RavenAIFunction(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from raven.raven_ai.doctype.raven_ai_function_params.raven_ai_function_params import (
			RavenAIFunctionParams,
		)

		description: DF.SmallText
		function_definition: DF.JSON | None
		function_name: DF.Data
		function_path: DF.SmallText | None
		parameters: DF.Table[RavenAIFunctionParams]
		params: DF.JSON | None
		pass_parameters_as_json: DF.Check
		reference_doctype: DF.Link | None
		requires_write_permissions: DF.Check
		type: DF.Literal[
			"Get Document",
			"Get Multiple Documents",
			"Get List",
			"Create Document",
			"Create Multiple Documents",
			"Update Document",
			"Update Multiple Documents",
			"Delete Document",
			"Delete Multiple Documents",
			"Custom Function",
			"Send Message",
			"Attach File to Document",
			"Get Report Result",
		]
	# end: auto-generated types

	def before_validate(self):
		WRITE_PERMISSIONS = [
			"Create Document",
			"Create Multiple Documents",
			"Update Document",
			"Update Multiple Documents",
			"Delete Document",
			"Delete Multiple Documents",
			"Send Message",
			"Attach File to Document",
		]
		if self.type in WRITE_PERMISSIONS:
			self.requires_write_permissions = 1

		READ_PERMISSIONS = ["Get Document", "Get Multiple Documents", "Get Report Result", "Get List"]
		if self.type in READ_PERMISSIONS:
			self.requires_write_permissions = 0

		self.prepare_function_params()

		self.validate_json()

	def prepare_function_params(self):
		"""
		Set the function params based on the type of function and other inputs
		"""
		params = {}
		if self.type == "Get Document":
			params = {
				"type": "object",
				"properties": {
					"document_id": {
						"type": "string",
						"description": f"The ID of the {self.reference_doctype} to get",
					}
				},
				"required": ["document_id"],
				"additionalProperties": False,
			}

		elif self.type == "Get Multiple Documents":
			params = {
				"type": "object",
				"properties": {
					"document_ids": {
						"type": "array",
						"items": {"type": "string"},
						"description": f"The IDs of the {self.reference_doctype}s to get",
					}
				},
				"required": ["document_ids"],
				"additionalProperties": False,
			}

		elif self.type == "Delete Document":
			params = {
				"type": "object",
				"properties": {
					"document_id": {
						"type": "string",
						"description": f"The ID of the {self.reference_doctype} to delete",
					}
				},
				"required": ["document_id"],
				"additionalProperties": False,
			}

		elif self.type == "Delete Multiple Documents":
			params = {
				"type": "object",
				"properties": {
					"document_ids": {
						"type": "array",
						"items": {"type": "string"},
						"description": f"The IDs of the {self.reference_doctype}s to delete",
					}
				},
				"required": ["document_ids"],
				"additionalProperties": False,
			}
		else:
			params = self.build_params_json_from_table()

		self.params = json.dumps(params, indent=4)

	def build_params_json_from_table(self):
		params = {
			"type": "object",
			"additionalProperties": False,
		}

		required = []
		properties = {}

		if self.type == "Update Document" or type == "Update Multiple Documents":
			properties["document_id"] = {
				"type": "string",
				"description": f"The ID of the {self.reference_doctype} to update",
			}
			required.append("document_id")

		for param in self.parameters:
			if param.do_not_ask_ai and not param.default_value and param.required:
				frappe.throw(
					_("You need to provide a default value for required parameters that are not asked by the AI.")
				)

			if param.do_not_ask_ai:
				continue
			obj = {
				"type": param.type,
				"description": param.description,
			}

			if param.type == "string" and param.options:
				obj["enum"] = param.options.split("\n")

			properties[param.fieldname] = obj

			if param.required:
				required.append(param.fieldname)

		if self.type == "Create Multiple Documents" or self.type == "Update Multiple Documents":
			params["properties"] = {
				"data": {
					"type": "array",
					"items": {
						"type": "object",
						"properties": properties,
						"required": required,
					},
					"minItems": 1,
				}
			}
		else:
			params["properties"] = properties
			params["required"] = required

		return params

	def validate_json(self):
		if self.type == "Custom Function":
			if not self.function_path:
				frappe.throw(_("Function path is required for Custom Functions"))

			# Check if JSON is valid and format it
			try:
				json.loads(self.params)
			except json.JSONDecodeError:
				frappe.throw(_("Invalid JSON in params"))

			self.params = json.dumps(json.loads(self.params), indent=4)

	def validate(self):
		# Functions cannot be named after core functions
		INVALID_FUNCTION_NAMES = [
			"attach_file_to_document",
			"get_document",
			"get_documents",
			"get_list",
			"create_document",
			"create_documents",
			"update_document",
			"update_documents",
			"delete_document",
			"delete_documents",
		]
		if self.function_name in INVALID_FUNCTION_NAMES:
			frappe.throw(
				_("Function name cannot be one of the core functions. Please choose a different name.")
			)

		DOCUMENT_REF_FUNCTIONS = [
			"Get Document",
			"Get Multiple Documents",
			"Get List",
			"Create Document",
			"Create Multiple Documents",
			"Update Document",
			"Update Multiple Documents",
			"Delete Document",
			"Delete Multiple Documents",
		]
		if self.type in DOCUMENT_REF_FUNCTIONS:
			if not self.reference_doctype:
				frappe.throw(_("Please select a DocType for this function."))

		# Validate if the function is whitelisted
		if self.type == "Custom Function":
			f = frappe.get_attr(self.function_path)
			if not f:
				frappe.throw(_("Function not found"))

			is_whitelisted(f)

	def before_save(self):
		# Generate the function definition from the variables + function name + description
		if isinstance(self.params, str):
			params = json.loads(self.params)

		else:
			params = self.params

		function_definition = {
			"name": self.function_name,
			"description": self.description,
			"parameters": params,
		}

		self.function_definition = json.dumps(function_definition, indent=4)

	def on_update(self):
		# Update all the bots that use this function

		bots = frappe.get_all("Raven Bot Functions", filters={"function": self.name}, pluck="parent")

		for bot in bots:
			bot = frappe.get_doc("Raven Bot", bot)
			bot.update_openai_assistant()
