# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _

class RavenUser(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		first_name: DF.Data | None
		full_name: DF.Data
		user: DF.Link
		user_image: DF.AttachImage | None
	# end: auto-generated types

	def before_save(self):
		self.update_photo_from_user()
	
	def after_insert(self):
		self.update_user_role()
	
	def update_user_role(self):
		user = frappe.get_doc("User", self.user)
		user.flags.ignore_permissions = True
		if "Raven User" not in user.get("roles"):
			user.append_roles("Raven User")
		
		user.save()
	
	def update_photo_from_user(self):
		'''
		 We need to create a new File record for the user image and attach it to the Raven User record.
		 Why not just copy the URL from the User record? Because the URL is not accessible to the Raven User,
		 and Frappe creates a duplicate file in the system (that is public) but does not update the URL in the field.
		'''
		user_image = frappe.db.get_value("User", self.user, "user_image")
		if user_image and not self.user_image:
			image_file = frappe.get_doc(
						{
							"doctype": "File",
							"file_url": user_image,
							"attached_to_doctype": "Raven User",
							"attached_to_name": self.name,
							"attached_to_field": "user_image",
							"is_private": 1,
						}
					).insert()
			self.user_image = image_file.file_url
	pass


def validate_raven_user_role(doc, method):
	# called via User hook
	if "Raven User" in [d.role for d in doc.get("roles")]:
		if not frappe.db.get_value("Raven User", {"user": doc.name}):
			frappe.msgprint(_("Please create a Raven User directly from the Raven User List to add the role."))
			doc.get("roles").remove(doc.get("roles", {"role": "Raven User"})[0])

@frappe.whitelist()
def reset_user_permissions(**args):
	doc = args.get("doc")
	doc_json = frappe.parse_json(doc)
	print(doc_json)
	if doc_json.get("name"):
		raven_user = frappe.get_doc("Raven User", doc_json.get("name"))
		raven_user.update_user_role()
	
	return "Raven User role added to user."