# Copyright (c) 2024, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import json

import frappe
from frappe.model.document import Document


class RavenAIFunction(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		description: DF.SmallText
		function_definition: DF.JSON | None
		function_name: DF.Data
		function_path: DF.SmallText | None
		params: DF.JSON | None
		pass_parameters_as_json: DF.Check
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

		self.validate_json()

	def validate_json(self):
		if self.type == "Custom Function":
			if not self.function_path:
				frappe.throw("Function path is required for Custom Functions")

		# Check if JSON is valid and format it
		try:
			json.loads(self.params)
		except json.JSONDecodeError:
			frappe.throw("Invalid JSON in params")

		self.params = json.dumps(json.loads(self.params), indent=4)

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
