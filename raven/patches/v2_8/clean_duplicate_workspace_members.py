import frappe
from frappe.query_builder.functions import Count


def execute():
	"""
	Find duplicate workspace members and keep the oldest record for each (workspace, user) pair.
	If any duplicate has admin access, preserve admin access on the kept record.
	"""
	raven_workspace_member = frappe.qb.DocType("Raven Workspace Member")

	duplicate_workspace_members = (
		frappe.qb.from_(raven_workspace_member)
		.select(
			raven_workspace_member.workspace,
			raven_workspace_member.user,
			Count(raven_workspace_member.name).as_("count"),
		)
		.groupby(raven_workspace_member.workspace, raven_workspace_member.user)
		.having(Count(raven_workspace_member.name) > 1)
	).run(as_dict=True)

	if not duplicate_workspace_members:
		return

	for duplicate in duplicate_workspace_members:
		workspace_members = frappe.get_all(
			"Raven Workspace Member",
			filters={"workspace": duplicate.workspace, "user": duplicate.user},
			fields=["name", "is_admin"],
			order_by="creation asc",
		)
		if not workspace_members:
			continue

		oldest_member = workspace_members[0]
		other_members = workspace_members[1:]

		if any(member.is_admin for member in other_members) and not oldest_member.is_admin:
			frappe.db.set_value(
				"Raven Workspace Member", oldest_member.name, "is_admin", 1, update_modified=False
			)

		if other_member_names := [member.name for member in other_members]:
			frappe.db.delete("Raven Workspace Member", {"name": ["in", other_member_names]})
