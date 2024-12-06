import frappe
from frappe import _
from frappe.query_builder import Case, JoinType, Order


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
