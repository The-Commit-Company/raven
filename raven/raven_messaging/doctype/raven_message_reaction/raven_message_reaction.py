# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

import json

import frappe
from frappe import _
from frappe.model.document import Document

from raven.api.reactions import calculate_message_reaction


class RavenMessageReaction(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		channel_id: DF.Link | None
		is_custom: DF.Check
		message: DF.Link
		reaction: DF.Data
		reaction_escaped: DF.Data | None
	# end: auto-generated types

	def after_insert(self):
		# Update the count for the current reaction
		calculate_message_reaction(self.message, self.channel_id)

	def after_delete(self):
		# Update the count for the current reaction
		calculate_message_reaction(self.message, self.channel_id)


def on_doctype_update():
	frappe.db.add_unique(
		"Raven Message Reaction",
		fields=["message", "owner", "reaction_escaped"],
		constraint_name="unique_reaction",
	)
