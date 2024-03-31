# Copyright (c) 2024, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RavenPoll(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF
		from raven.raven_messaging.doctype.raven_poll_option.raven_poll_option import RavenPollOption

		is_anonymous: DF.Check
		is_disabled: DF.Check
		is_multi_choice: DF.Check
		options: DF.Table[RavenPollOption]
		question: DF.SmallText
		total_votes: DF.Int
	# end: auto-generated types

	def before_validate(self):
		total_votes = 0
		for option in self.options:
			total_votes += option.votes or 0
		
		self.total_votes = total_votes

	def on_trash(self):
		# Delete all poll votes
		frappe.db.delete("Raven Poll Vote", {"poll_id": self.name})


	pass