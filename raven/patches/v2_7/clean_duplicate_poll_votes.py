import frappe
from frappe.query_builder.functions import Count
from pypika import Order


def execute():

	raven_poll_vote = frappe.qb.DocType("Raven Poll Vote")
	raven_poll = frappe.qb.DocType("Raven Poll")

	affected_polls = set()

	# STEP 1: Solving first problem of - Same Poll, Same User, Same option
	# Only Keep Oldest(creation) and delete all other duplicates.

	exact_duplicates = (
		frappe.qb.from_(raven_poll_vote)
		.select(
			raven_poll_vote.poll_id,
			raven_poll_vote.user_id,
			raven_poll_vote.option,
		)
		.groupby(
			raven_poll_vote.poll_id,
			raven_poll_vote.user_id,
			raven_poll_vote.option,
		)
		.having(Count(raven_poll_vote.name) > 1)
	).run(as_dict=True)

	# Step 2: For each duplicate, get all votes and delete non-oldest
	for dup in exact_duplicates:
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

	# STEP 2: Same poll, same user, different options in single select poll
	# Here we keep - last modified - assuming that the last chosen option was the one last intended by the user.
	# Last chosen option may not have been the intended choice, but we can't really know which one was intended
	# so last one is the best guess.

	single_select_duplicates = (
		frappe.qb.from_(raven_poll_vote)
		.join(raven_poll)
		.on(raven_poll_vote.poll_id == raven_poll.name)
		.select(
			raven_poll_vote.poll_id,
			raven_poll_vote.user_id,
		)
		.where(raven_poll.is_multi_choice == 0)
		.groupby(raven_poll_vote.poll_id, raven_poll_vote.user_id)
		.having(Count(raven_poll_vote.name) > 1)
	).run(as_dict=True)

	for dup in single_select_duplicates:
		# Get all votes for the duplicate ordered by modified timestamp(newest first)
		votes = (
			frappe.qb.from_(raven_poll_vote)
			.select(raven_poll_vote.name)
			.where(raven_poll_vote.poll_id == dup.poll_id)
			.where(raven_poll_vote.user_id == dup.user_id)
			.orderby(raven_poll_vote.modified, order=Order.desc)
		).run(pluck="name")

		# Delete all except last modified
		for vote_name in votes[1:]:
			frappe.delete_doc("Raven Poll Vote", vote_name, delete_permanently=True)

		affected_polls.add(dup.poll_id)

	# NOTE: Multi-select poll duplicates (same poll, same user, different options) are handled
	# in migrate_poll_votes_to_poll_vote_selection.py - that's where data model transformation
	# and option consolidation happens.

	# STEP 3: Recalculate counts for all affected polls
	from raven.raven_messaging.doctype.raven_poll_vote.raven_poll_vote import update_poll_votes

	if not affected_polls:
		return

	for poll_id in affected_polls:
		update_poll_votes(poll_id)
