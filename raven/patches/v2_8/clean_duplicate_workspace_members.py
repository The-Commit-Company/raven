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

	frappe.db.sql(
		"""
		UPDATE `tabRaven Workspace Member` rwm
		INNER JOIN (
			SELECT workspace, user, MIN(creation) as min_creation
			FROM `tabRaven Workspace Member`
			GROUP BY workspace, user
			HAVING COUNT(*) > 1
		) oldest ON rwm.workspace = oldest.workspace
			AND rwm.user = oldest.user
			AND rwm.creation = oldest.min_creation
		SET rwm.is_admin = 1
		WHERE EXISTS (
			SELECT 1 FROM `tabRaven Workspace Member` dup
			WHERE dup.workspace = rwm.workspace
				AND dup.user = rwm.user
				AND dup.is_admin = 1
		)
		"""
	)

	frappe.db.sql(
		"""
		DELETE rwm FROM `tabRaven Workspace Member` rwm
		INNER JOIN (
			SELECT workspace, user, MIN(creation) as min_creation
			FROM `tabRaven Workspace Member`
			GROUP BY workspace, user
			HAVING COUNT(*) > 1
		) duplicates ON rwm.workspace = duplicates.workspace
			AND rwm.user = duplicates.user
			AND rwm.creation > duplicates.min_creation
		"""
	)
