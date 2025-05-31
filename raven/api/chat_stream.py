import datetime

import frappe
from frappe import _
from frappe.query_builder import Order

from raven.utils import track_channel_visit


@frappe.whitelist()
# def get_messages(channel_id: str, limit: int = 20, base_message: str | None = None):
# 	"""
# 	API to get list of messages for a channel, ordered by creation date (newest first)

# 	"""

# 	# Check permission for channel access
# 	if not frappe.has_permission(doctype="Raven Channel", doc=channel_id, ptype="read"):
# 		frappe.throw(_("You do not have permission to access this channel"), frappe.PermissionError)

# 	# Fetch messages for the channel
# 	if base_message:
# 		return get_messages_around_base(channel_id, base_message)

# 	# Cannot use `get_all` as it does not apply the `order_by` clause to multiple fields
# 	message = frappe.qb.DocType("Raven Message")

# 	messages = (
# 		frappe.qb.from_(message)
# 		.select(
# 			message.name,
# 			message.owner,
# 			message.creation,
# 			message.modified,
# 			message.text,
# 			message.file,
# 			message.message_type,
# 			message.message_reactions,
# 			message.is_reply,
# 			message.linked_message,
# 			message._liked_by,
# 			message.channel_id,
# 			message.thumbnail_width,
# 			message.thumbnail_height,
# 			message.file_thumbnail,
# 			message.link_doctype,
# 			message.link_document,
# 			message.replied_message_details,
# 			message.content,
# 			message.is_edited,
# 			message.is_forwarded,
# 			message.poll_id,
# 			message.is_bot_message,
# 			message.bot,
# 			message.hide_link_preview,
# 			message.is_thread,
# 			message.blurhash,
# 		)
# 		.where(message.channel_id == channel_id)
# 		.orderby(message.creation, order=Order.desc)
# 		.orderby(message.name, order=Order.desc)
# 		.limit(limit)
# 		.run(as_dict=True)
# 	)

# 	has_old_messages = False

# 	# Check if older messages are available
# 	if len(messages) == limit:
# 		# Check if there are more messages available
# 		older_message = frappe.db.get_all(
# 			"Raven Message",
# 			pluck="name",
# 			filters={"channel_id": channel_id, "creation": ("<", messages[-1].creation)},
# 			order_by="creation desc, name desc",
# 			limit=1,
# 		)

# 		if len(older_message) > 0:
# 			has_old_messages = True

# 	track_channel_visit(channel_id=channel_id, commit=True)
# 	return {
# 		"messages": messages,
# 		"has_old_messages": has_old_messages,
# 		"has_new_messages": False,
# 	}


@frappe.whitelist()
def get_messages(channel_id: str, limit: int = 20, base_message: str | None = None):
	if not frappe.has_permission(doctype="Raven Channel", doc=channel_id, ptype="read"):
		frappe.throw(_("You do not have permission to access this channel"), frappe.PermissionError)

	message = frappe.qb.DocType("Raven Message")

	def select_message_fields(qb):
		return qb.select(
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
			message.is_forwarded,
			message.poll_id,
			message.is_bot_message,
			message.bot,
			message.hide_link_preview,
			message.is_thread,
			message.blurhash,
			message.sequence,
		)

	if base_message:
		return get_messages_around_base(channel_id, base_message)

	channel_member = frappe.db.get_value(
		"Raven Channel Member",
		{"channel_id": channel_id, "user_id": frappe.session.user},
		["last_seen_sequence"],
		as_dict=True,
	)
	last_seen_sequence = channel_member.last_seen_sequence if channel_member else 0

	current_sequence = frappe.db.sql(
		"SELECT MAX(sequence) FROM `tabRaven Message` WHERE channel_id = %s",
		(channel_id,),
	)[0][0] or 0

	has_new_messages = last_seen_sequence < current_sequence
	messages = []

	if has_new_messages:
		new_messages = (
			select_message_fields(frappe.qb.from_(message))
			.where((message.channel_id == channel_id) & (message.sequence > last_seen_sequence))
			.orderby(message.sequence, order=Order.asc)
			.limit(limit)
			.run(as_dict=True)
		)

		if len(new_messages) < limit:
			extra_needed = limit - len(new_messages)
			old_messages = (
				select_message_fields(frappe.qb.from_(message))
				.where((message.channel_id == channel_id) & (message.sequence <= last_seen_sequence))
				.orderby(message.sequence, order=Order.desc)
				.limit(extra_needed)
				.run(as_dict=True)
			)
			messages = list(reversed(old_messages)) + new_messages
		else:
			messages = new_messages
	else:
		messages = (
			select_message_fields(frappe.qb.from_(message))
			.where(message.channel_id == channel_id)
			.orderby(message.sequence, order=Order.desc)
			.limit(limit)
			.run(as_dict=True)
		)

	has_old_messages = False
	if len(messages) == limit:
		last_sequence = messages[-1]["sequence"]
		older_exists = frappe.db.exists(
			"Raven Message",
			{"channel_id": channel_id, "sequence": ("<", last_sequence)},
		)
		has_old_messages = bool(older_exists)

	track_channel_visit(channel_id=channel_id, commit=True)

	return {
		"messages": messages,
		"has_old_messages": has_old_messages,
		"has_new_messages": has_new_messages,
		"last_seen_sequence": last_seen_sequence,
		"current_sequence": current_sequence,
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
		frappe.throw(_("You do not have permission to access this channel"), frappe.PermissionError)
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
			message.is_forwarded,
			message.poll_id,
			message.is_bot_message,
			message.bot,
			message.hide_link_preview,
			message.is_thread,
			message.blurhash,
			message.sequence,
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
		frappe.throw(_("You do not have permission to access this channel"), frappe.PermissionError)

	# Fetch older messages for the channel
	from_timestamp = frappe.get_cached_value("Raven Message", from_message, "creation")

	response = fetch_newer_messages(
		channel_id, from_message, from_timestamp, limit, include_from_message=False
	)

	if response.get("has_new_messages") == False:
		# If no newer messages are available, we can track it as a visit to the channel
		# There are cases when we want to publish the unread count update event for a specific user
		# Example: The user is viewing an older message in a channel. If a new message comes up, the sidebar shows an unread count
		# Now if the user scrolls to the bottom, we need to update the unread count
		track_channel_visit(channel_id=channel_id, commit=True, publish_event_for_user=True)

	return response


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
			message.is_forwarded,
			message.poll_id,
			message.is_bot_message,
			message.bot,
			message.hide_link_preview,
			message.is_thread,
			message.blurhash,
			message.sequence  # 👈 Thêm trường sequence vào đây
		)
		.where(message.channel_id == channel_id)
		.where(condition)
		.orderby(message.creation, order=Order.asc)
		.orderby(message.name, order=Order.asc)
		.limit(limit)
		.run(as_dict=True)
	)

	has_new_messages = False

	if len(messages) == limit:
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

	messages.reverse()
	return {"messages": messages, "has_new_messages": has_new_messages}
