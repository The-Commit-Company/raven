import frappe

from raven.api.raven_message import check_permission

@frappe.whitelist(methods=["POST"])
def create_poll(channel_id: str, question: str, options:any, is_multi_choice:bool = None, is_anonymous:bool=None) -> str:
	"""
	Create a new poll in the Raven Poll doctype.
	"""
	# Check if the current user has access to the channel to create a poll.
	check_permission(channel_id)

	poll = frappe.get_doc(
		{
			"doctype": "Raven Poll",
			"question": question,
			"is_multi_choice": is_multi_choice,
			"is_anonymous": is_anonymous,
			"channel_id": channel_id,
		}
	)

	for option in options:
		poll.append('options', option)

	poll.insert()

	# Poll message content is the poll question and options separated by a newline. (This would help with the searchability of the poll)
	poll_message_content = f"{question}\n"

	for option in options:
		poll_message_content += f" {option['option']}\n"

	# Send a message to the channel with type "poll" and the poll_id.
	message = frappe.get_doc(
				{
					"doctype": "Raven Message",
					"channel_id": channel_id,
					"text": '',
					"content": poll_message_content,
					"message_type": "Poll",
					"poll_id": poll.name,
				}
			)
	message.insert()

	return poll.name


@frappe.whitelist()
def get_poll(poll_id, channel_id):
	"""
	Get the poll data from the Raven Poll doctype.
	(Including the poll options and the number of votes for each option.)
	"""
	# Check if the current user has access to the channel in which the poll was created.
	check_permission(channel_id)

	poll = frappe.get_cached_doc("Raven Poll", poll_id)

	return poll


@frappe.whitelist(methods=["POST"])
def add_vote(poll_id, channel_id, option_id):

	# Check if the current user has access to the channel in which the poll was created.
	check_permission(channel_id)

	poll = frappe.get_cached_doc("Raven Poll", poll_id)
	votes = frappe.get_all(
		"Raven Poll Vote",
		filters={"poll_id": poll_id, "user_id": frappe.session.user},
		fields=["name", "option"],
	)

	# Check if the poll is disabled
	if poll.is_disabled:
		frappe.throw("Poll is disabled. No more votes allowed.")

	if poll.is_multi_choice:
		# Check if the user has already voted for a option
		if option_id in [vote.option for vote in votes]:
			frappe.throw("You have already voted for this option.")
		else:
			frappe.get_doc(
				{
					"doctype": "Raven Poll Vote",
					"poll_id": poll_id,
					"option": option_id,
					"user_id": frappe.session.user,
				}
			).insert()
	else:
		# Check if the user has already voted
		if votes:
			frappe.throw("You have already voted.")
		else:
			frappe.get_doc(
				{
					"doctype": "Raven Poll Vote",
					"poll_id": poll_id,
					"option": option_id,
					"user_id": frappe.session.user,
				}
			).insert()

	frappe.db.commit()

	return poll
