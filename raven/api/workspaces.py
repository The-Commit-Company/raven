import frappe
from frappe import _
from frappe.utils.caching import redis_cache


@frappe.whitelist()
def get_list():
	"""
	TODO: This is a temporary function to fetch all workspaces.
	Fetches list of all workspaces that the current user is a member of/has access to
	"""
	frappe.has_permission("Raven Workspace", throw=True)

	all_workspaces = get_workspaces()

	# Only return workspaces that the current user is a member of

	return all_workspaces


@redis_cache()
def get_workspaces():
	"""
	Fetches list of all workspaces
	"""
	return frappe.db.get_all(
		"Raven Workspace",
		fields=["workspace_name", "name", "logo", "type", "can_only_join_via_invite"],
		order_by="creation asc",
	)
