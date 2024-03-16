import datetime

import frappe
from frappe.query_builder import Order

from raven.api.raven_message import track_visit


@frappe.whitelist()
def get_messages(channel_id: str, limit: int = 20, base_message: str | None = None):
	"""
	API to get list of messages for a channel, ordered by creation date (newest first)

	"""

	# Check permission for channel access
	if not frappe.has_permission(doctype="Raven Channel", doc=channel_id, ptype="read"):
		frappe.throw("You do not have permission to access this channel", frappe.PermissionError)

	# Fetch messages for the channel
	if base_message:
		return get_messages_around_base(channel_id, base_message)

	# Cannot use `get_all` as it does not apply the `order_by` clause to multiple fields
	message = frappe.qb.DocType("Raven Message")

	messages = (
		frappe.qb.from_(message)
		.select(
			message.name,
			message.owner,
			message.creation,
			message.modified,
			message.text,
			message.file,
			message.message_type,
			message.message_reactions,
			message.is_reply,
			message.linked_message,
			message._liked_by,
			message.channel_id,
			message.thumbnail_width,
			message.thumbnail_height,
			message.file_thumbnail,
			message.link_doctype,
			message.link_document,
			message.replied_message_details,
			message.content,
			message.is_edited,
		)
		.where(message.channel_id == channel_id)
		.orderby(message.creation, order=Order.desc)
		.orderby(message.name, order=Order.desc)
		.limit(limit)
		.run(as_dict=True)
	)

	has_old_messages = False

	# Check if older messages are available
	if len(messages) == limit:
		# Check if there are more messages available
		older_message = frappe.db.get_all(
			"Raven Message",
			pluck="name",
			filters={"channel_id": channel_id, "creation": ("<", messages[-1].creation)},
			order_by="creation desc, name desc",
			limit=1,
		)

		if len(older_message) > 0:
			has_old_messages = True

	track_visit(channel_id=channel_id, commit=True)
	return {
		"messages": messages,
		"has_old_messages": has_old_messages,
		"has_new_messages": False,
	}


def get_messages_around_base(channel_id: str, base_message: str):
	"""
	Get 10 messages before base message and 10 messages after
	"""
	# Fetch older messages for the channel
	from_timestamp = frappe.get_cached_value("Raven Message", base_message, "creation")

	# TODO: Optimize this to use a complex SQL query to fetch around the main message
	older_messages = fetch_older_messages(channel_id, base_message, from_timestamp, 10)
	newer_messages = fetch_newer_messages(
		channel_id, base_message, from_timestamp, 10, include_from_message=True
	)

	combined_messages = newer_messages.get("messages", []) + older_messages.get("messages", [])

	return {
		**older_messages,
		**newer_messages,
		"messages": combined_messages,
		"from_timestamp": from_timestamp,
	}


@frappe.whitelist()
def get_older_messages(channel_id: str, from_message: str, limit: int = 20):
	"""
	API to get older messages for a channel, ordered by creation date (newest first)

	Function is split into two to avoid duplicate perm check and timestamp check
	"""

	# Check permission for channel access
	if not frappe.has_permission(doctype="Raven Channel", doc=channel_id, ptype="read"):
		frappe.throw("You do not have permission to access this channel", frappe.PermissionError)
	# Fetch older messages for the channel
	from_timestamp = frappe.get_cached_value("Raven Message", from_message, "creation")

	return fetch_older_messages(channel_id, from_message, from_timestamp, limit)


def fetch_older_messages(
	channel_id: str, from_message: str, from_timestamp: datetime.datetime, limit: int = 20
):
	# Cannot use `get_all` as it does not apply the `order_by` clause to multiple fields
	message = frappe.qb.DocType("Raven Message")

	messages = (
		frappe.qb.from_(message)
		.select(
			message.name,
			message.owner,
			message.creation,
			message.modified,
			message.text,
			message.file,
			message.message_type,
			message.message_reactions,
			message.is_reply,
			message.linked_message,
			message._liked_by,
			message.channel_id,
			message.thumbnail_width,
			message.thumbnail_height,
			message.file_thumbnail,
			message.link_doctype,
			message.link_document,
			message.replied_message_details,
			message.content,
			message.is_edited,
		)
		.where(message.channel_id == channel_id)
		.where(
			(message.creation < from_timestamp)
			| ((message.creation == from_timestamp) & (message.name < from_message))
		)
		.orderby(message.creation, order=Order.desc)
		.orderby(message.name, order=Order.desc)
		.limit(limit)
		.run(as_dict=True)
	)

	has_old_messages = False

	# Check if older messages are available
	if len(messages) == limit:
		# Check if there are more messages available
		older_message = frappe.db.get_all(
			"Raven Message",
			pluck="name",
			filters={
				"channel_id": channel_id,
				"creation": ("<=", messages[-1].creation),
				"name": ["!=", messages[-1].name],
			},
			order_by="creation desc, name desc",
			limit=1,
		)

		if len(older_message) > 0:
			has_old_messages = True

	return {"messages": messages, "has_old_messages": has_old_messages}


@frappe.whitelist()
def get_newer_messages(channel_id: str, from_message: str, limit: int = 20):
	"""
	API to get older messages for a channel, ordered by creation date (newest first)
	"""

	# Check permission for channel access
	if not frappe.has_permission(doctype="Raven Channel", doc=channel_id, ptype="read"):
		frappe.throw("You do not have permission to access this channel", frappe.PermissionError)

	# Fetch older messages for the channel
	from_timestamp = frappe.get_cached_value("Raven Message", from_message, "creation")

	return fetch_newer_messages(
		channel_id, from_message, from_timestamp, limit, include_from_message=False
	)


def fetch_newer_messages(
	channel_id: str,
	from_message: str,
	from_timestamp: datetime.datetime,
	limit: int = 20,
	include_from_message: bool = False,
):

	message = frappe.qb.DocType("Raven Message")

	if include_from_message:
		condition = (message.creation > from_timestamp) | (
			(message.creation == from_timestamp) & (message.name >= from_message)
		)

	else:
		condition = (message.creation > from_timestamp) | (
			(message.creation == from_timestamp) & (message.name > from_message)
		)

	messages = (
		frappe.qb.from_(message)
		.select(
			message.name,
			message.owner,
			message.creation,
			message.modified,
			message.text,
			message.file,
			message.message_type,
			message.message_reactions,
			message.is_reply,
			message.linked_message,
			message._liked_by,
			message.channel_id,
			message.thumbnail_width,
			message.thumbnail_height,
			message.file_thumbnail,
			message.link_doctype,
			message.link_document,
			message.replied_message_details,
			message.content,
			message.is_edited,
		)
		.where(message.channel_id == channel_id)
		.where(condition)
		.orderby(message.creation, order=Order.asc)
		.orderby(message.name, order=Order.asc)
		.limit(limit)
		.run(as_dict=True)
	)

	has_new_messages = False

	# Check if newer messages are available
	if len(messages) == limit:
		# Check if there are more messages available
		newer_message = frappe.db.get_all(
			"Raven Message",
			pluck="name",
			filters={
				"channel_id": channel_id,
				"creation": (">=", messages[-1].creation),
				"name": ["!=", messages[-1].name],
			},
			order_by="creation asc, name asc",
			limit=1,
		)

		if len(newer_message) > 0:
			has_new_messages = True

	# The messages are in ascending order, so reverse them
	messages.reverse()
	return {"messages": messages, "has_new_messages": has_new_messages}
