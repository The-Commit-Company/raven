import frappe
from frappe.query_builder import Order
from frappe.query_builder.functions import Count, Max, Min


@frappe.whitelist(methods=["GET"])
def get_notifications(
	notification_type: str = None, limit: int = 10, start: int = 0, unread_only: bool = False
):
	"""
	Get notifications for the current user.
	notification_type: 'mention' | 'reaction' | None (both, merged, sorted by creation)
	unread_only: True to return only unread items
	limit: max results (capped at 100)
	start: offset for pagination
	"""
	limit = min(int(limit), 100)

	if notification_type == "mention":
		return _get_mention_notifications(limit, start, unread_only)
	elif notification_type == "reaction":
		return _get_reaction_notifications(limit, start, unread_only)
	else:
		fetch = limit + start
		mentions = _get_mention_notifications(fetch, 0, unread_only)
		reactions = _get_reaction_notifications(fetch, 0, unread_only)
		# Rare collision possible if random id of Raven Mention is same as Raven Message in merged results.
		merged = mentions + reactions
		merged.sort(key=lambda x: x["creation"], reverse=True)
		return merged[start : start + limit]


def _get_mention_notifications(limit, start, unread_only):
	# sql query to fetch mentions for current user
	mention = frappe.qb.DocType("Raven Mention")
	message = frappe.qb.DocType("Raven Message")
	channel = frappe.qb.DocType("Raven Channel")
	channel_member = frappe.qb.DocType("Raven Channel Member")
	workspace_member = frappe.qb.DocType("Raven Workspace Member")

	query = (
		frappe.qb.from_(mention)
		.select(
			mention.name,
			mention.is_read,
			mention.parent.as_("message_id"),
			message.channel_id,
			message.owner,
			message.creation,
			message.text,
			message.message_type,
			channel.type.as_("channel_type"),
			channel.channel_name,
			channel.workspace,
			channel.is_thread,
			channel.is_direct_message,
		)
		.join(message)
		.on(mention.parent == message.name)
		.join(channel)
		.on(message.channel_id == channel.name)
		.left_join(channel_member)
		.on(
			(channel.name == channel_member.channel_id) & (channel_member.user_id == frappe.session.user)
		)
		.left_join(workspace_member)
		.on(
			(channel.workspace == workspace_member.workspace)
			& (workspace_member.user == frappe.session.user)
		)
		.where(mention.user == frappe.session.user)
		.where(message.owner != frappe.session.user)
		.where(
			(channel_member.user_id == frappe.session.user)
			| ((workspace_member.user == frappe.session.user) & (channel.type != "Private"))
		)
		.orderby(message.creation, order=Order.desc)
		.limit(limit)
		.offset(start)
	)

	if unread_only:
		query = query.where(mention.is_read == 0)

	results = query.run(as_dict=True)
	for r in results:
		r["notification_type"] = "mention"
	return results


def _get_reaction_notifications(limit, start, unread_only):
	user = frappe.session.user
	reaction = frappe.qb.DocType("Raven Message Reaction")
	message = frappe.qb.DocType("Raven Message")
	channel = frappe.qb.DocType("Raven Channel")
	channel_member = frappe.qb.DocType("Raven Channel Member")
	workspace_member = frappe.qb.DocType("Raven Workspace Member")

	access_condition = (channel_member.user_id == user) | (
		(workspace_member.user == user) & (channel.type != "Private")
	)

	query = (
		frappe.qb.from_(reaction)
		.select(
			reaction.message.as_("name"),
			reaction.message.as_("message_id"),
			reaction.channel_id,
			Min(reaction.is_read).as_("is_read"),
			Max(reaction.creation).as_("creation"),
			message.owner,
			message.text,
			message.message_type,
			channel.type.as_("channel_type"),
			channel.channel_name,
			channel.workspace,
			channel.is_thread,
			channel.is_direct_message,
		)
		.join(message)
		.on(reaction.message == message.name)
		.join(channel)
		.on(reaction.channel_id == channel.name)
		.left_join(channel_member)
		.on((channel.name == channel_member.channel_id) & (channel_member.user_id == user))
		.left_join(workspace_member)
		.on((channel.workspace == workspace_member.workspace) & (workspace_member.user == user))
		.where(message.owner == user)
		.where(reaction.owner != user)
		.where(access_condition)
		.groupby(
			reaction.message,
			reaction.channel_id,
			message.owner,
			message.text,
			message.message_type,
			channel.type,
			channel.channel_name,
			channel.workspace,
			channel.is_thread,
			channel.is_direct_message,
		)
		.orderby(Max(reaction.creation), order=Order.desc)
		.limit(limit)
		.offset(start)
	)

	if unread_only:
		query = query.having(Min(reaction.is_read) == 0)

	results = query.run(as_dict=True)
	if not results:
		return []

	message_ids = [r["message_id"] for r in results]
	reaction_rows = (
		frappe.qb.from_(reaction)
		.select(reaction.message, reaction.owner, reaction.reaction)
		.where(reaction.message.isin(message_ids))
		.where(reaction.owner != user)
		.orderby(reaction.creation, order=Order.desc)
	).run(as_dict=True)

	reactors_by_message = {message_id: [] for message_id in message_ids}
	reactions_by_message = {message_id: [] for message_id in message_ids}
	for row in reaction_rows:
		reactors_by_message[row["message"]].append(row["owner"])
		reactions_by_message[row["message"]].append(row["reaction"])

	for r in results:
		r["notification_type"] = "reaction"
		r["reactors"] = list(dict.fromkeys(reactors_by_message[r["message_id"]]))
		r["reactions"] = list(dict.fromkeys(reactions_by_message[r["message_id"]]))
	return results


@frappe.whitelist(methods=["GET"])
def get_unread_notifications_count():
	"""
	Count of unread notifications for current user: unread mentions + grouped unread reactions
	(distinct messages with any unread reaction). Matches the access filters used by
	get_notifications so the badge agrees with the list.
	"""
	user = frappe.session.user
	mention = frappe.qb.DocType("Raven Mention")
	reaction = frappe.qb.DocType("Raven Message Reaction")
	message = frappe.qb.DocType("Raven Message")
	channel = frappe.qb.DocType("Raven Channel")
	channel_member = frappe.qb.DocType("Raven Channel Member")
	workspace_member = frappe.qb.DocType("Raven Workspace Member")

	access_condition = (channel_member.user_id == user) | (
		(workspace_member.user == user) & (channel.type != "Private")
	)

	mention_result = (
		frappe.qb.from_(mention)
		.select(Count(mention.name).distinct().as_("mention_count"))
		.join(message)
		.on(mention.parent == message.name)
		.join(channel)
		.on(message.channel_id == channel.name)
		.left_join(channel_member)
		.on((channel.name == channel_member.channel_id) & (channel_member.user_id == user))
		.left_join(workspace_member)
		.on((channel.workspace == workspace_member.workspace) & (workspace_member.user == user))
		.where(mention.user == user)
		.where(mention.is_read == 0)
		.where(message.owner != user)
		.where(access_condition)
	).run(as_dict=True)
	mention_count = mention_result[0].mention_count if mention_result else 0

	reaction_groups = (
		frappe.qb.from_(reaction)
		.select(reaction.message)
		.join(message)
		.on(reaction.message == message.name)
		.join(channel)
		.on(reaction.channel_id == channel.name)
		.left_join(channel_member)
		.on((channel.name == channel_member.channel_id) & (channel_member.user_id == user))
		.left_join(workspace_member)
		.on((channel.workspace == workspace_member.workspace) & (workspace_member.user == user))
		.where(message.owner == user)
		.where(reaction.owner != user)
		.where(reaction.is_read == 0)
		.where(access_condition)
		.distinct()
	).run()
	reaction_count = len(reaction_groups)

	return int(mention_count) + int(reaction_count)


@frappe.whitelist(methods=["POST"])
def mark_all_notifications_read():
	"""Mark all notifications (mentions + reactions) as read for current user"""
	user = frappe.session.user
	mention = frappe.qb.DocType("Raven Mention")
	reaction = frappe.qb.DocType("Raven Message Reaction")
	message = frappe.qb.DocType("Raven Message")

	(
		frappe.qb.update(mention)
		.set(mention.is_read, 1)
		.where(mention.user == user)
		.where(mention.is_read == 0)
	).run()

	user_messages = frappe.qb.from_(message).select(message.name).where(message.owner == user)
	(
		frappe.qb.update(reaction)
		.set(reaction.is_read, 1)
		.where(reaction.message.isin(user_messages))
		.where(reaction.owner != user)
		.where(reaction.is_read == 0)
	).run()

	frappe.publish_realtime("all_notifications_read", {}, user=user, after_commit=True)
	return "ok"


@frappe.whitelist(methods=["POST"])
def mark_message_notifications_read(message_id: str):
	"""Mark all notifications linked to a message as read for current user"""
	user = frappe.session.user
	mention = frappe.qb.DocType("Raven Mention")
	reaction = frappe.qb.DocType("Raven Message Reaction")
	message = frappe.qb.DocType("Raven Message")

	(
		frappe.qb.update(mention)
		.set(mention.is_read, 1)
		.where(mention.parent == message_id)
		.where(mention.user == user)
		.where(mention.is_read == 0)
	).run()

	user_messages = frappe.qb.from_(message).select(message.name).where(message.owner == user)
	(
		frappe.qb.update(reaction)
		.set(reaction.is_read, 1)
		.where(reaction.message == message_id)
		.where(reaction.message.isin(user_messages))
		.where(reaction.owner != user)
		.where(reaction.is_read == 0)
	).run()

	frappe.publish_realtime(
		"message_notifications_read",
		{"message_id": message_id},
		user=user,
		after_commit=True,
	)
	return "ok"
