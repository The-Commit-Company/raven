from raven.raven_channel_management.doctype.raven_channel_member.raven_channel_member import (
	on_doctype_update,
)


def execute():
	# Indexing all Raven Channel Members
	on_doctype_update()
