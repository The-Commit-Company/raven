import frappe
from frappe.query_builder import Order


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
	# sql query to fetch message reactions for current user, grouped by message and channel, excluding self reactions

	user = frappe.session.user
	having_clause = "HAVING MIN(rmr.is_read) = 0" if unread_only else ""

	results = frappe.db.sql(
		f"""
		SELECT
			rmr.message AS name,
			rmr.message AS message_id,
			rmr.channel_id,
			-- DISTINCT inside GROUP_CONCAT picks an indeterminate ORDER BY value per group in MariaDB.
			-- Concat with dups ordered by creation DESC, dedup in Python preserving newest-first order.
			GROUP_CONCAT(rmr.owner ORDER BY rmr.creation DESC SEPARATOR ',') AS reactors,
			GROUP_CONCAT(rmr.reaction ORDER BY rmr.creation DESC SEPARATOR ',') AS reactions,
			MIN(rmr.is_read) AS is_read,
			MAX(rmr.creation) AS creation,
			msg.owner,
			msg.text,
			msg.message_type,
			ch.type AS channel_type,
			ch.channel_name,
			ch.workspace,
			ch.is_thread,
			ch.is_direct_message
		FROM `tabRaven Message Reaction` rmr
		JOIN `tabRaven Message` msg ON rmr.message = msg.name
		JOIN `tabRaven Channel` ch ON rmr.channel_id = ch.name
		WHERE msg.owner = %(user)s AND rmr.owner != %(user)s
		  AND (
		      EXISTS (
		          SELECT 1 FROM `tabRaven Channel Member` cm
		          WHERE cm.channel_id = ch.name AND cm.user_id = %(user)s
		      )
		      OR (
		          ch.type != 'Private' AND EXISTS (
		              SELECT 1 FROM `tabRaven Workspace Member` wm
		              WHERE wm.workspace = ch.workspace AND wm.user = %(user)s
		          )
		      )
		  )
		GROUP BY rmr.message, rmr.channel_id, msg.owner, msg.text, msg.message_type,
		         ch.type, ch.channel_name, ch.workspace, ch.is_thread, ch.is_direct_message
		{having_clause}
		ORDER BY MAX(rmr.creation) DESC
		LIMIT %(limit)s OFFSET %(start)s
		""",
		{"user": user, "limit": limit, "start": start},
		as_dict=True,
	)

	for r in results:
		r["notification_type"] = "reaction"
		# dedup reactors and reactions while preserving order
		r["reactors"] = list(dict.fromkeys(r["reactors"].split(","))) if r["reactors"] else []
		r["reactions"] = list(dict.fromkeys(r["reactions"].split(","))) if r["reactions"] else []
	return results


@frappe.whitelist(methods=["GET"])
def get_unread_notifications_count():
	"""
	Count of unread notifications for current user: unread mentions + grouped unread reactions
	(distinct messages with any unread reaction). Matches the access filters used by
	get_notifications so the badge agrees with the list.
	"""
	user = frappe.session.user

	mention_count = frappe.db.sql(
		"""
		SELECT COUNT(*)
		FROM `tabRaven Mention` m
		JOIN `tabRaven Message` msg ON m.parent = msg.name
		JOIN `tabRaven Channel` ch ON msg.channel_id = ch.name
		LEFT JOIN `tabRaven Channel Member` cm
		  ON ch.name = cm.channel_id AND cm.user_id = %(user)s
		LEFT JOIN `tabRaven Workspace Member` wm
		  ON ch.workspace = wm.workspace AND wm.user = %(user)s
		WHERE m.user = %(user)s
		  AND m.is_read = 0
		  AND msg.owner != %(user)s
		  AND (cm.user_id = %(user)s OR (wm.user = %(user)s AND ch.type != 'Private'))
		""",
		{"user": user},
	)[0][0]

	reaction_count = frappe.db.sql(
		"""
		SELECT COUNT(DISTINCT rmr.message)
		FROM `tabRaven Message Reaction` rmr
		JOIN `tabRaven Message` msg ON rmr.message = msg.name
		JOIN `tabRaven Channel` ch ON rmr.channel_id = ch.name
		WHERE msg.owner = %(user)s
		  AND rmr.owner != %(user)s
		  AND rmr.is_read = 0
		  AND (
		      EXISTS (
		          SELECT 1 FROM `tabRaven Channel Member` cm
		          WHERE cm.channel_id = ch.name AND cm.user_id = %(user)s
		      )
		      OR (
		          ch.type != 'Private' AND EXISTS (
		              SELECT 1 FROM `tabRaven Workspace Member` wm
		              WHERE wm.workspace = ch.workspace AND wm.user = %(user)s
		          )
		      )
		  )
		""",
		{"user": user},
	)[0][0]

	return int(mention_count) + int(reaction_count)


@frappe.whitelist(methods=["POST"])
def mark_all_notifications_read():
	"""Mark all notifications (mentions + reactions) as read for current user"""
	user = frappe.session.user

	frappe.db.sql(
		"UPDATE `tabRaven Mention` SET is_read = 1 WHERE user = %(user)s AND is_read = 0",
		{"user": user},
	)

	frappe.db.sql(
		"""
		UPDATE `tabRaven Message Reaction` rmr
		JOIN `tabRaven Message` msg ON rmr.message = msg.name
		SET rmr.is_read = 1
		WHERE msg.owner = %(user)s AND rmr.owner != %(user)s AND rmr.is_read = 0
	""",
		{"user": user},
	)

	frappe.publish_realtime("all_notifications_read", {}, user=user, after_commit=True)
	return "ok"


@frappe.whitelist(methods=["POST"])
def mark_message_notifications_read(message_id: str):
	"""Mark all notifications linked to a message as read for current user"""
	user = frappe.session.user

	frappe.db.sql(
		"""
		UPDATE `tabRaven Mention`
		SET is_read = 1
		WHERE parent = %(message_id)s AND user = %(user)s AND is_read = 0
	""",
		{"message_id": message_id, "user": user},
	)

	frappe.db.sql(
		"""
		UPDATE `tabRaven Message Reaction` rmr
		JOIN `tabRaven Message` msg ON rmr.message = msg.name
		SET rmr.is_read = 1
		WHERE rmr.message = %(message_id)s AND msg.owner = %(user)s
		  AND rmr.owner != %(user)s AND rmr.is_read = 0
	""",
		{"message_id": message_id, "user": user},
	)

	frappe.publish_realtime(
		"message_notifications_read",
		{"message_id": message_id},
		user=user,
		after_commit=True,
	)
	return "ok"
