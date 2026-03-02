import frappe


def execute():
	"""
	Add unique constraint on Raven Poll Vote (poll_id, user_id).
	This prevents users from voting multiple times in the same poll.
	"""
	frappe.db.add_unique(
		"Raven Poll Vote",
		fields=["poll_id", "user_id"],
		constraint_name="unique_poll_vote_user",
	)
