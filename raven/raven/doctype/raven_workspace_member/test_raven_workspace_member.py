# Copyright (c) 2024, The Commit Company (Algocode Technologies Pvt. Ltd.) and Contributors
# See license.txt

# import frappe
from unittest.mock import patch

from frappe.tests import IntegrationTestCase, UnitTestCase

from raven.raven.doctype.raven_workspace_member import raven_workspace_member

# On IntegrationTestCase, the doctype test records and all
# link-field test record depdendencies are recursively loaded
# Use these module variables to add/remove to/from that list
EXTRA_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]
IGNORE_TEST_RECORD_DEPENDENCIES = []  # eg. ["User"]


class TestRavenWorkspaceMember(UnitTestCase):
	"""
	Unit tests for RavenWorkspaceMember.
	Use this class for testing individual functions and methods.
	"""

	pass


class TestRavenWorkspaceMember(IntegrationTestCase):
	"""
	Integration tests for RavenWorkspaceMember.
	Use this class for testing interactions between multiple components.
	"""

	def test_on_doctype_update_adds_unique_constraint(self):
		with patch.object(raven_workspace_member.frappe.db, "add_unique") as mock_add_unique:
			raven_workspace_member.on_doctype_update()

		mock_add_unique.assert_called_once_with(
			"Raven Workspace Member",
			fields=["workspace", "user"],
			constraint_name="unique_workspace_member",
		)
