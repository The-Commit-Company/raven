import frappe
from frappe import _
from frappe.query_builder import JoinType, Order


@frappe.whitelist()
def get_list():
	"""
	Fetches list of all workspaces that the current user is a member of/has access to
	"""
	if not frappe.db.exists("Raven User", {"user": frappe.session.user}):
		frappe.throw(_("You do not have access to Raven."), frappe.PermissionError)

	workspace = frappe.qb.DocType("Raven Workspace")
	workspace_member = frappe.qb.DocType("Raven Workspace Member")

	all_workspaces = (
		frappe.qb.from_(workspace)
		.join(workspace_member, JoinType.left)
		.on(
			(workspace.name == workspace_member.workspace) & (workspace_member.user == frappe.session.user)
		)
		.where((workspace_member.user == frappe.session.user) | (workspace.type == "Public"))
		.select(
			workspace.workspace_name,
			workspace.name,
			workspace.logo,
			workspace.type,
			workspace.description,
			workspace.can_only_join_via_invite,
			workspace_member.name.as_("workspace_member_name"),
			workspace_member.is_admin.as_("is_admin"),
		)
		.orderby(workspace.creation, order=Order.asc)
	)

	return all_workspaces.run(as_dict=True)


@frappe.whitelist()
def join_workspace(workspace: str):
	"""
	Joins a workspace
	"""
	member = frappe.get_doc(
		{"doctype": "Raven Workspace Member", "workspace": workspace, "user": frappe.session.user}
	).insert()

	return member


@frappe.whitelist()
def leave_workspace(workspace: str):
	"""
	Leaves a workspace
	"""
	member = frappe.db.exists(
		"Raven Workspace Member", {"workspace": workspace, "user": frappe.session.user}
	)
	if member:
		member_doc = frappe.get_doc("Raven Workspace Member", member)
		member_doc.delete()

	else:
		frappe.throw(_("You are not a member of this workspace."), frappe.PermissionError)


@frappe.whitelist()
def is_workspace_admin(workspace: str):
	"""
	Checks if the current user is an admin of a workspace
	"""
	workspace_member = frappe.get_doc(
		"Raven Workspace Member", {"workspace": workspace, "user": frappe.session.user}
	)

	if workspace_member and workspace_member.is_admin:
		return True

	return False


@frappe.whitelist()
def fetch_workspace_members(workspace: str):
	"""
	Gets all members of a workspace
	"""
	frappe.has_permission("Raven Workspace", doc=workspace, throw=True)
	return frappe.get_all(
		"Raven Workspace Member",
		filters={"workspace": workspace},
		fields=["user", "is_admin", "creation", "name"],
	)
