import frappe
from frappe.query_builder import Order
from frappe.query_builder.functions import Count


@frappe.whitelist(methods=["POST"])
def get_mentions(limit: int = 10, start: int = 0):
	"""
	Get the messages where the current user is mentioned - ordered by creation date
	Also update the last mention viewed date if the start is 0
	"""

	# Max number of mentions that we will return is 100
	if start >= 100:
		return []

	mention = frappe.qb.DocType("Raven Mention")
	message = frappe.qb.DocType("Raven Message")
	channel = frappe.qb.DocType("Raven Channel")
	channel_member = frappe.qb.DocType("Raven Channel Member")

	query = (
		frappe.qb.from_(mention)
		.select(
			message.name,
			message.channel_id,
			channel.type.as_("channel_type"),
			channel.channel_name,
			channel.workspace,
			channel.is_thread,
			channel.is_direct_message,
			message.creation,
			message.message_type,
			message.owner,
			message.text,
		)
		.left_join(message)
		.on(mention.parent == message.name)
		.left_join(channel)
		.on(message.channel_id == channel.name)
		.left_join(channel_member)
		.on(
			(channel.name == channel_member.channel_id) & (channel_member.user_id == frappe.session.user)
		)
		.where(mention.user == frappe.session.user)
		.where(message.owner != frappe.session.user)
		.where(channel_member.user_id == frappe.session.user)
		.orderby(message.creation, order=Order.desc)
		.limit(limit)
		.offset(start)
	)

	result = query.run(as_dict=True)

	if start == 0:
		frappe.db.set_value(
			"Raven User",
			{"user": frappe.session.user},
			"last_mention_viewed_on",
			frappe.utils.get_datetime(),
			update_modified=False,
		)
	return result


@frappe.whitelist(methods=["GET"])
def get_unread_mention_count():
	"""
	Get the number of mentions for the current user since the last mention viewed date
	"""

	last_mention_viewed_date = frappe.db.get_value(
		"Raven User", {"user": frappe.session.user}, "last_mention_viewed_on"
	)

	if not last_mention_viewed_date:
		# Date when the feature was launched
		last_mention_viewed_date = "2025-02-28 00:00:00"

	mention = frappe.qb.DocType("Raven Mention")
	message = frappe.qb.DocType("Raven Message")
	channel = frappe.qb.DocType("Raven Channel")
	channel_member = frappe.qb.DocType("Raven Channel Member")

	# Join mention with message and message with channel.
	# Only fetch count for where the user is a member of the channel

	query = (
		frappe.qb.from_(mention)
		.select(Count(mention.name).as_("mention_count"))
		.left_join(message)
		.on(mention.parent == message.name)
		.left_join(channel)
		.on(message.channel_id == channel.name)
		.left_join(channel_member)
		.on(
			(channel.name == channel_member.channel_id) & (channel_member.user_id == frappe.session.user)
		)
		.where(mention.user == frappe.session.user)
		.where(channel_member.user_id == frappe.session.user)
		.where(message.creation > last_mention_viewed_date)
		.where(message.owner != frappe.session.user)
	)
	result = query.run(as_dict=True)
	if result:
		return result[0].mention_count
	else:
		return 0
