import json

import frappe
from frappe import _

from raven.utils import is_channel_member


@frappe.whitelist(methods=["POST"])
def react(message_id: str, reaction: str, is_custom: bool = False, emoji_name: str = None):
	"""
	API to react/unreact to a message.
	Checks if the user can react to the message
	First checks if the user has already reacted to the message.
	If yes, then unreacts (deletes), else reacts (creates).
	"""

	# PERF: No need for permission checks here.
	# The permission checks are done in the controller method for the doctype

	channel_id = frappe.get_cached_value("Raven Message", message_id, "channel_id")
	channel_type = frappe.get_cached_value("Raven Channel", channel_id, "type")

	if channel_type == "Private":

		if not is_channel_member(channel_id):
			frappe.throw(_("You do not have permission to react to this message"), frappe.PermissionError)

	if is_custom:
		# The reaction is a custom emoji with a URL
		reaction_escaped = emoji_name
	else:
		reaction_escaped = reaction.encode("unicode-escape").decode("utf-8").replace("\\u", "")
	user = frappe.session.user
	existing_reaction = frappe.db.exists(
		"Raven Message Reaction",
		{"message": message_id, "owner": user, "reaction_escaped": reaction_escaped},
	)

	if existing_reaction:
		# Why not use frappe.db.delete?
		# Because frappe won't run the controller method for 'after_delete' if we do so,
		# and we need to calculate the new count of reactions for our message
		frappe.get_doc("Raven Message Reaction", existing_reaction).delete(delete_permanently=True)

	else:
		frappe.get_doc(
			{
				"doctype": "Raven Message Reaction",
				"reaction": reaction,
				"message": message_id,
				"channel_id": channel_id,
				"owner": user,
				"is_custom": is_custom,
				"reaction_escaped": reaction_escaped,
			}
		).insert(ignore_permissions=True)
	return "Ok"


def calculate_message_reaction(message_id, channel_id: str = None):

	reactions = frappe.get_all(
		"Raven Message Reaction",
		fields=["owner", "reaction", "is_custom", "reaction_escaped"],
		filters={"message": message_id},
		order_by="reaction_escaped",
	)

	total_reactions = {}

	for reaction_item in reactions:
		item_key = reaction_item.reaction_escaped if reaction_item.is_custom else reaction_item.reaction
		if item_key in total_reactions:
			existing_reaction = total_reactions[item_key]
			new_users = existing_reaction.get("users")
			new_users.append(reaction_item.owner)
			total_reactions[item_key] = {
				"count": existing_reaction.get("count") + 1,
				"users": new_users,
				"reaction": reaction_item.reaction,
				"is_custom": reaction_item.is_custom,
			}

		else:
			total_reactions[item_key] = {
				"count": 1,
				"users": [reaction_item.owner],
				"reaction": reaction_item.reaction,
				"is_custom": reaction_item.is_custom,
			}
	frappe.db.set_value(
		"Raven Message",
		message_id,
		"message_reactions",
		json.dumps(total_reactions),
		update_modified=False,
	)
	frappe.publish_realtime(
		"message_reacted",
		{
			"channel_id": channel_id,
			"sender": frappe.session.user,
			"message_id": message_id,
			"reactions": json.dumps(total_reactions),
		},
		doctype="Raven Channel",
		docname=channel_id,  # Adding this to automatically add the room for the event via Frappe
		after_commit=False,
	)
