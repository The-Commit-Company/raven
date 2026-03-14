# Copyright (c) 2024, The Commit Company (Algocode Technologies Pvt. Ltd.) and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase

from raven.ai.sdk_tools import handle_get_document


class TestRavenAIFunction(FrappeTestCase):
	def make_function_name(self, prefix="test_get_doc"):
		return f"{prefix}_{frappe.generate_hash(length=6)}"

	def test_allow_any_doctype_builds_generic_get_document_schema(self):
		function = frappe.get_doc(
			{
				"doctype": "Raven AI Function",
				"function_name": self.make_function_name(),
				"description": "Fetch any permitted document",
				"type": "Get Document",
				"allow_any_doctype": 1,
			}
		).insert()

		params = function.get_params_as_dict()
		self.assertEqual(params["required"], ["doctype", "document_id"])
		self.assertIn("doctype", params["properties"])
		self.assertIn("document_id", params["properties"])

	def test_allow_any_doctype_builds_generic_get_list_schema(self):
		function = frappe.get_doc(
			{
				"doctype": "Raven AI Function",
				"function_name": self.make_function_name("test_get_list"),
				"description": "List records from any DocType",
				"type": "Get List",
				"allow_any_doctype": 1,
			}
		).insert()

		params = function.get_params_as_dict()
		self.assertIn("doctype", params["properties"])
		self.assertIn("filters", params["properties"])
		self.assertEqual(params["required"][0], "doctype")

	def test_allow_any_doctype_requires_supported_type(self):
		function = frappe.get_doc(
			{
				"doctype": "Raven AI Function",
				"function_name": self.make_function_name("test_report"),
				"description": "Run a report",
				"type": "Get Report Result",
				"allow_any_doctype": 1,
			}
		)

		with self.assertRaises(frappe.ValidationError):
			function.insert()

	def test_handle_get_document_supports_generic_doctype_reads(self):
		result = handle_get_document(
			document_id="Administrator",
			doctype="User",
			allow_any_doctype=True,
		)

		self.assertTrue(result["success"])
		self.assertEqual(result["result"]["name"], "Administrator")
