# Copyright (c) 2024, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RavenWorkspace(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		can_only_join_via_invite: DF.Check
		logo: DF.AttachImage | None
		type: DF.Literal["Public", "Private"]
		workspace_name: DF.Data
	# end: auto-generated types

	def after_insert(self):
		self.create_member_for_owner()
		self.invalidate_workspace_list_cache()

	def on_update(self):
		self.invalidate_workspace_list_cache()

	def on_trash(self):
		# Delete all members when the workspace is deleted
		frappe.db.delete("Raven Workspace Member", {"workspace": self.name})
		# Delete all channels when the workspace is deleted
		frappe.db.delete("Raven Channel", {"workspace": self.name})
		self.invalidate_workspace_list_cache()

	def create_member_for_owner(self):
		member = frappe.new_doc("Raven Workspace Member")
		member.workspace = self.name
		member.user = self.owner
		member.is_admin = True
		member.insert(ignore_permissions=True)

	def invalidate_workspace_list_cache(self):

		from raven.api.workspaces import get_workspaces

		get_workspaces.clear_cache()
