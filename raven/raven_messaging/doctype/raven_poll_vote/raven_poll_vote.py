# Copyright (c) 2024, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.query_builder.functions import Count


class RavenPollVote(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		option: DF.Data
		poll_id: DF.Link
		user_id: DF.Link
	# end: auto-generated types

	def before_insert(self):
		# check if the poll is still open
		poll = frappe.get_cached_doc("Raven Poll", self.poll_id)
		if poll.is_disabled:
			frappe.throw(_("This poll is closed."))

		# check if the option is valid
		if not frappe.db.exists(
			"Raven Poll Option",
			{
				"parent": self.poll_id,
				"name": self.option,
			},
		):
			frappe.throw(_("Invalid option selected."))

		# check if the user has already voted for this option in this poll
		if frappe.db.exists(
			"Raven Poll Vote",
			{
				"poll_id": self.poll_id,
				"user_id": self.user_id,
				"option": self.option,
			},
		):
			frappe.throw(_("You have already voted for this option."))

	def validate(self):
		# Check if the user_id is the same as the logged in user
		if self.user_id != frappe.session.user:
			frappe.throw(_("You can only vote for yourself."))

	def after_insert(self):
		update_poll_votes(self.poll_id)

	def after_delete(self):
		update_poll_votes(self.poll_id)


def update_poll_votes(poll_id):
	"""
	To update all the votes in a poll, instead of updating the document directly, just write to the child table to avoid setting the "modified" timestamp.
	"""
	poll = frappe.get_doc("Raven Poll", poll_id, for_update=True)
	# get votes for each option
	poll_vote = frappe.qb.DocType("Raven Poll Vote")

	poll_votes = (
		frappe.qb.from_(poll_vote)
		.select(poll_vote.option, Count(poll_vote.name).as_("votes"))
		.where(poll_vote.poll_id == poll_id)
		.groupby(poll_vote.option)
		.run(as_dict=True)
	)

	users = frappe.get_all(
		"Raven Poll Vote", filters={"poll_id": poll_id}, group_by="user_id", fields=["user_id"]
	)

	total_votes = len(users) if users else 0

	# update the votes for each option in the poll
	for option in poll.options:
		option.votes = 0
		for vote in poll_votes:
			if option.name == vote.option:
				option.votes = vote.votes
				break

		frappe.db.set_value(
			"Raven Poll Option", option.name, "votes", option.votes, update_modified=False
		)

	frappe.db.set_value("Raven Poll", poll_id, "total_votes", total_votes, update_modified=False)
	poll.total_votes = total_votes

	poll.notify_update()
