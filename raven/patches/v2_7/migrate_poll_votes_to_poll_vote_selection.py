import frappe
from frappe.query_builder.functions import Count


def execute():
	"""
	Migrate poll votes from flat `option` link field to child table `vote_selection`.

	For multi-select polls: consolidate multiple vote records per user into one record
	with all their options in the child table.

	For single-select polls: migrate the option to child table.
	"""

	if not frappe.db.has_column("Raven Poll Vote", "option"):
		return

	raven_poll_vote = frappe.qb.DocType("Raven Poll Vote")
	raven_poll = frappe.qb.DocType("Raven Poll")

	# For multi-select polls - users could have multiple vote records (one per option).
	# consolidate them into ONE vote record with all their options in child table.
	multi_select_duplicates = (
		frappe.qb.from_(raven_poll_vote)
		.join(raven_poll)
		.on(raven_poll_vote.poll_id == raven_poll.name)
		.select(
			raven_poll_vote.poll_id,
			raven_poll_vote.user_id,
		)
		.where(raven_poll.is_multi_choice == 1)
		.groupby(raven_poll_vote.poll_id, raven_poll_vote.user_id)
		.having(Count(raven_poll_vote.name) > 1)
	).run(as_dict=True)

	for dup in multi_select_duplicates:
		# Get all votes for this user in this multi-select poll
		votes = (
			frappe.qb.from_(raven_poll_vote)
			.select(raven_poll_vote.name, raven_poll_vote.option)
			.where(raven_poll_vote.poll_id == dup.poll_id)
			.where(raven_poll_vote.user_id == dup.user_id)
			.orderby(raven_poll_vote.creation)
		).run(as_dict=True)

		# Keep oldest vote record, consolidate ALL options into it
		vote_to_keep = votes[0]

		for idx, vote in enumerate(votes):
			if vote.option:
				frappe.get_doc(
					{
						"doctype": "Raven Poll Vote Selection",
						"parent": vote_to_keep.name,
						"parentfield": "vote_selection",
						"parenttype": "Raven Poll Vote",
						"idx": idx + 1,
						"option": vote.option,
					}
				).insert()

		# Delete duplicate vote records (all except the one we're keeping)
		for vote in votes[1:]:
			frappe.delete_doc("Raven Poll Vote", vote.name, delete_permanently=True)

	votes_to_migrate = (
		frappe.qb.from_(raven_poll_vote)
		.select(
			raven_poll_vote.name,
			raven_poll_vote.option,
		)
		.where(raven_poll_vote.option.isnotnull())
		.where(raven_poll_vote.option != "")
	).run(as_dict=True)

	if not votes_to_migrate:
		return

	for vote in votes_to_migrate:
		# Skip if child record already exists (from multi-select consolidation above)
		existing = frappe.db.exists(
			"Raven Poll Vote Selection", {"parent": vote.name, "option": vote.option}
		)
		if not existing:
			frappe.get_doc(
				{
					"doctype": "Raven Poll Vote Selection",
					"parent": vote.name,
					"parentfield": "vote_selection",
					"parenttype": "Raven Poll Vote",
					"idx": 1,
					"option": vote.option,
				}
			).insert()
