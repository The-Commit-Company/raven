import frappe
from frappe import _
from frappe.utils.caching import redis_cache


@frappe.whitelist()
def get_list():
	"""
	Fetches list of all workspaces that the current user is a member of/has access to
	"""
	frappe.has_permission("Raven Workspace", throw=True)

	all_workspaces = get_workspaces()

	# Only return workspaces that the current user is a member of


@redis_cache()
def get_workspaces():
	"""
	Fetches list of all workspaces
	"""
	return frappe.db.get_all(
		"Raven Workspace",
		fields=["workspace_name", "logo", "type", "can_only_join_via_invite"],
		order_by="creation asc",
	)
