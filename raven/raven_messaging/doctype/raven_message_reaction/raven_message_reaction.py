# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

import json

import frappe
from frappe.model.document import Document

from raven.api.reactions import calculate_message_reaction


class RavenMessageReaction(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		channel_id: DF.Link | None
		message: DF.Link
		reaction: DF.Data
		reaction_escaped: DF.Data | None
	# end: auto-generated types

	def before_save(self):
		"""Escape the reaction to UTF-8 (XXXX)"""
		self.reaction_escaped = self.reaction.encode("unicode-escape").decode("utf-8").replace("\\u", "")

	def after_insert(self):
		# Update the count for the current reaction
		calculate_message_reaction(self.message)

	def after_delete(self):
		# Update the count for the current reaction
		calculate_message_reaction(self.message)
