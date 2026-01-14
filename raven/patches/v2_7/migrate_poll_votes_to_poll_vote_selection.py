import frappe


def execute():
	"""
	Migrate poll votes from flat `option` link field to child table `vote_selection`.

	For each vote where `option` is populated:
	1. Create a child Raven Poll Vote Selection record

	"""

	if not frappe.db.has_column("Raven Poll Vote", "option"):
		return

	raven_poll_vote = frappe.qb.DocType("Raven Poll Vote")

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
		frappe.get_doc(
			{
				"doctype": "Raven Poll Vote Selection",
				"parent": vote.name,
				"parentfield": "vote_selection",
				"parenttype": "Raven Poll Vote",
				"option": vote.option,
			}
		).insert()
