# Copyright (c) 2024, The Commit Company and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase


class TestRavenBot(FrappeTestCase):
	def test_bot_allows_any_doctype_functions_without_extra_flag(self):
		function = frappe.get_doc(
			{
				"doctype": "Raven AI Function",
				"function_name": f"test_get_doc_{frappe.generate_hash(length=6)}",
				"description": "Fetch any permitted document",
				"type": "Get Document",
				"allow_any_doctype": 1,
			}
		).insert()

		bot = frappe.new_doc("Raven Bot")
		bot.bot_name = f"Test Bot {frappe.generate_hash(length=6)}"
		bot.bot_functions = [frappe._dict(function=function.name)]
		bot.validate_functions()
