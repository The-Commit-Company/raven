import frappe
from frappe.query_builder.functions import Count


def execute():

	raven_poll_vote = frappe.qb.DocType("Raven Poll Vote")

	# Step 1: Find duplicate combinations
	duplicate_combinations = (
		frappe.qb.from_(raven_poll_vote)
		.select(raven_poll_vote.poll_id, raven_poll_vote.user_id, raven_poll_vote.option)
		.groupby(raven_poll_vote.poll_id, raven_poll_vote.user_id, raven_poll_vote.option)
		.having(Count(raven_poll_vote.name) > 1)
	).run(as_dict=True)

	if not duplicate_combinations:
		return

	affected_polls = set()

	# Step 2: For each duplicate, get all votes and delete non-oldest
	for dup in duplicate_combinations:
		votes = (
			frappe.qb.from_(raven_poll_vote)
			.select(raven_poll_vote.name)
			.where(raven_poll_vote.poll_id == dup.poll_id)
			.where(raven_poll_vote.user_id == dup.user_id)
			.where(raven_poll_vote.option == dup.option)
			.orderby(raven_poll_vote.creation)
		).run(pluck="name")

		# Delete all except oldest (first one as ordered by creation)
		for vote_name in votes[1:]:
			frappe.delete_doc("Raven Poll Vote", vote_name, delete_permanently=True)

		affected_polls.add(dup.poll_id)

	# Recalculate counts
	from raven.raven_messaging.doctype.raven_poll_vote.raven_poll_vote import update_poll_votes

	for poll_id in affected_polls:
		update_poll_votes(poll_id)
