import frappe
from frappe import _


@frappe.whitelist(methods=["POST"])
def create_poll(
	channel_id: str,
	question: str,
	options: list,
	is_multi_choice: bool = None,
	is_anonymous: bool = None,
	end_date: str = None,
) -> str:
	"""
	Create a new poll in the Raven Poll doctype.
	"""
	# Check if the current user has access to the channel to create a poll.
	if not frappe.has_permission(doctype="Raven Channel", doc=channel_id, ptype="read"):
		frappe.throw(_("You do not have permission to access this channel"), frappe.PermissionError)

	poll = frappe.get_doc(
		{
			"doctype": "Raven Poll",
			"question": question,
			"is_multi_choice": is_multi_choice,
			"is_anonymous": is_anonymous,
			"end_date": end_date,
			"channel_id": channel_id,
		}
	)

	for option in options:
		poll.append("options", option)

	poll.insert()

	# Poll message content is the poll question and options separated by a newline. (This would help with the searchability of the poll)
	poll_message_content = f"{question}\n"

	for index, option in enumerate(options):
		poll_message_content += f"{index + 1}. {option['option']}\n"

	# Send a message to the channel with type "poll" and the poll_id.
	message = frappe.get_doc(
		{
			"doctype": "Raven Message",
			"channel_id": channel_id,
			"text": "",
			"content": poll_message_content,
			"message_type": "Poll",
			"poll_id": poll.name,
		}
	)
	message.insert()

	return poll.name


@frappe.whitelist()
def get_poll(message_id):
	"""
	Get the poll data from the Raven Poll doctype.
	(Including the poll options, the number of votes for each option and the total number of votes.)
	"""

	# Check if the current user has access to the message.
	if not frappe.has_permission(doctype="Raven Message", doc=message_id, ptype="read"):
		frappe.throw(_("You do not have permission to access this message"), frappe.PermissionError)

	poll_id = frappe.get_cached_value("Raven Message", message_id, "poll_id")

	poll = frappe.get_cached_doc("Raven Poll", poll_id)

	# Check if the current user has already voted in the poll, if so, return the poll with the user's vote.
	current_user_vote = frappe.get_all(
		"Raven Poll Vote",
		filters={"poll_id": poll_id, "user_id": frappe.session.user},
		fields=["option"],
	)

	if current_user_vote:
		poll.current_user_vote = current_user_vote

	return {"poll": poll, "current_user_votes": current_user_vote}


@frappe.whitelist(methods=["POST"])
def add_vote(message_id, option_id):

	# Check if the current user has access to the message.
	if not frappe.has_permission(doctype="Raven Message", doc=message_id, ptype="read"):
		frappe.throw(_("You do not have permission to access this message"), frappe.PermissionError)

	poll_id = frappe.get_cached_value("Raven Message", message_id, "poll_id")
	is_poll_multi_choice = frappe.get_cached_value("Raven Poll", poll_id, "is_multi_choice")
	is_disabled = frappe.get_cached_value("Raven Poll", poll_id, "is_disabled")

	# Check if the poll is closed
	if is_disabled:
		frappe.throw(_("This poll is closed and no longer accepting votes"), frappe.PermissionError)

	if is_poll_multi_choice:
		for option in option_id:
			frappe.get_doc(
				{
					"doctype": "Raven Poll Vote",
					"poll_id": poll_id,
					"option": option,
					"user_id": frappe.session.user,
				}
			).insert()
	else:
		frappe.get_doc(
			{
				"doctype": "Raven Poll Vote",
				"poll_id": poll_id,
				"option": option_id,
				"user_id": frappe.session.user,
			}
		).insert()

	return "Vote added successfully."


@frappe.whitelist(methods=["POST"])
def retract_vote(poll_id):
	# delete all votes by the user for the poll (this takes care of the case where the user has voted for multiple options in the same poll)
	user = frappe.session.user

	# Check if the poll is closed
	is_disabled = frappe.get_cached_value("Raven Poll", poll_id, "is_disabled")
	if is_disabled:
		frappe.throw(
			_("This poll is closed and you can no longer retract your vote"), frappe.PermissionError
		)

	votes = frappe.get_all(
		"Raven Poll Vote", filters={"poll_id": poll_id, "user_id": user}, fields=["name"]
	)
	if not votes:
		frappe.throw(_("You have not voted for any option in this poll."))
	else:
		for vote in votes:
			frappe.delete_doc("Raven Poll Vote", vote.name)


@frappe.whitelist()
def get_all_votes(poll_id):

	# Check if the current user has access to the poll
	if not frappe.has_permission(doctype="Raven Poll", doc=poll_id, ptype="read"):
		frappe.throw(_("You do not have permission to access this poll"), frappe.PermissionError)

	poll_doc = frappe.get_cached_doc("Raven Poll", poll_id)

	if poll_doc.is_anonymous:
		frappe.throw(
			_("This poll is anonymous. You do not have permission to access the votes."),
			frappe.PermissionError,
		)
	else:
		# Get all votes for this poll
		votes = frappe.get_all(
			"Raven Poll Vote", filters={"poll_id": poll_id}, fields=["name", "option", "user_id"]
		)

		# Initialize results dictionary
		results = {
			option.name: {"users": [], "count": option.votes} for option in poll_doc.options if option.votes
		}

		# Process votes
		for vote in votes:
			option = vote["option"]
			results[option]["users"].append(vote["user_id"])

		# Calculate total votes
		total_votes = sum(result["count"] for result in results.values())

		# Calculate percentages
		for result in results.values():
			result["percentage"] = (result["count"] / total_votes) * 100

		return results


@frappe.whitelist(methods=["POST"])
def close_poll(poll_id):
	"""
	Close a poll by setting is_disabled to 1 (only poll owner can close the poll)
	"""
	poll_owner = frappe.get_cached_value("Raven Poll", poll_id, "owner")
	is_poll_closed = frappe.get_cached_value("Raven Poll", poll_id, "is_disabled")

	# Check if the current user is the owner of the poll
	if poll_owner != frappe.session.user:
		frappe.throw(_("Only the poll owner can close the poll"), frappe.PermissionError)

	# Check if the poll is already closed
	if is_poll_closed:
		frappe.throw(_("This poll is already closed"), frappe.PermissionError)

	# Close the poll
	frappe.db.set_value("Raven Poll", poll_id, "is_disabled", 1)

	# Event to update the poll
	frappe.publish_realtime(
		"doc_update",
		{"doctype": "Raven Poll", "name": poll_id},
		doctype="Raven Poll",
		docname=poll_id,
		after_commit=True,
	)

	return "Poll closed successfully."
