import frappe

from raven.raven_channel_management.doctype.raven_channel_member.raven_channel_member import (
	on_doctype_update,
)


def execute():
	"""
	This patch adds the unique constraint to the Raven Channel Member table
	"""
	on_doctype_update()
