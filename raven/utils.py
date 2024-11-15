import frappe


def track_channel_visit(channel_id, user=None, commit=False, publish_event_for_user=False):
	"""
	Track the last visit of the user to the channel.
	    If the user is not a member of the channel, create a new member record
	"""

	if not user:
		user = frappe.session.user

	# Get the channel member record
	channel_member = get_channel_member(channel_id, user)

	if channel_member:
		# Update the last visit
		frappe.db.set_value("Raven Channel Member", channel_member, "last_visit", frappe.utils.now())

	# Else if the user is not a member of the channel and the channel is open, create a new member record
	elif frappe.get_cached_value("Raven Channel", channel_id, "type") == "Open":
		frappe.get_doc(
			{
				"doctype": "Raven Channel Member",
				"channel_id": channel_id,
				"user_id": frappe.session.user,
				"last_visit": frappe.utils.now(),
			}
		).insert()

	# Need to commit the changes to the database if the request is a GET request
	if commit:
		frappe.db.commit()  # nosempgrep

	if publish_event_for_user:
		frappe.publish_realtime(
			"raven:unread_channel_count_updated",
			{"channel_id": channel_id, "sent_by": frappe.session.user},
			user=user,
		)


def get_channel_member(channel_id, user=None):
	"""
	Get the channel member record
	"""

	if not user:
		user = frappe.session.user
	# TODO: Read this from the cache (https://github.com/The-Commit-Company/Raven/issues/762)
	return frappe.db.get_value(
		"Raven Channel Member", {"channel_id": channel_id, "user_id": frappe.session.user}, "name"
	)


def get_raven_user(user_id: str) -> str:
	"""
	Get the Raven User ID of a user
	"""
	# TODO: Run this via cache
	return frappe.db.get_value("Raven User", {"user": user_id}, "name")
