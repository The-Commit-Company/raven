from raven.raven.doctype.raven_workspace_member.raven_workspace_member import on_doctype_update


def execute():
	"""
	Add unique constraint to ensure one workspace membership per user.
	"""
	on_doctype_update()
