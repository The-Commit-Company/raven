from raven.raven_channel_management.doctype.raven_channel.raven_channel import on_doctype_update


def execute():
	"""
	This patch adds the unique constraint to the Raven Channel table
	"""
	on_doctype_update()
