import frappe
from frappe.desk.like import toggle_like
from frappe.query_builder import JoinType, Order
from frappe.utils.data import now_datetime


@frappe.whitelist(methods=["POST"])
def create_reminder(remind_at: str, message_id: str | None = None, description: str | None = None):
	user = frappe.session.user

	raven_reminder = frappe.new_doc("Raven Reminder")

	raven_reminder.remind_at = remind_at
	raven_reminder.description = description
	raven_reminder.user_id = user

	if message_id:
		raven_reminder.message_id = message_id

	raven_reminder.save()

	if message_id:
		toggle_like("Raven Message", message_id, "Yes")
		liked_by = frappe.db.get_value("Raven Message", message_id, "_liked_by")
		frappe.publish_realtime(
			"message_saved",
			{
				"message_id": message_id,
				"liked_by": liked_by,
			},
			user=frappe.session.user,
		)

	return "Reminder created"


@frappe.whitelist(methods=["POST"])
def update_reminder(reminder_id: str, remind_at: str, description: str | None = None):
	reminder = frappe.get_doc("Raven Reminder", reminder_id)

	reminder.remind_at = remind_at
	reminder.description = description

	reminder.save()

	return "Reminder updated"


def send_reminders():
	reminders = frappe.get_all(
		"Raven Reminder",
		filters=[
			("user_id", "=", frappe.session.user),
			("remind_at", "<=", now_datetime()),
			("is_complete", "=", 0),
		],
	)

	if len(reminders) == 0:
		return

	frappe.publish_realtime("due_reminders", {"message": reminders}, room="all", after_commit=True)


@frappe.whitelist(methods=["GET"])
def get_reminders(is_complete: bool):
	user = frappe.session.user

	raven_message = frappe.qb.DocType("Raven Message")
	raven_reminder = frappe.qb.DocType("Raven Reminder")
	raven_channel = frappe.qb.DocType("Raven Channel")

	query = (
		frappe.qb.from_(raven_reminder)
		.join(raven_message, JoinType.left)
		.on(raven_reminder.message_id == raven_message.name)
		.join(raven_channel, JoinType.left)
		.on(raven_message.channel_id == raven_channel.name)
		.select(
			raven_reminder.name,
			raven_reminder.remind_at,
			raven_reminder.description,
			raven_reminder.is_complete,
			raven_reminder.completed_at,
			raven_reminder.message_id,
			raven_channel.channel_name,
			raven_channel.is_direct_message,
		)
		.where(raven_reminder.user_id == user)
	)

	if is_complete:
		query = query.where(raven_reminder.is_complete == 1)
		query = query.orderby(raven_reminder.completed_at, order=Order.desc)
	else:
		query = query.where(raven_reminder.is_complete == 0)
		query = query.orderby(raven_reminder.creation, order=Order.desc)

	reminders = query.run(as_dict=True)

	return reminders


@frappe.whitelist(methods=["GET"])
def get_overdue_reminders():
	user = frappe.session.user

	reminders = frappe.get_all(
		"Raven Reminder",
		filters=[("user_id", "=", user), ("remind_at", "<=", now_datetime()), ("is_complete", "=", 0)],
		fields=["name"],
	)
	return reminders


@frappe.whitelist(methods=["POST"])
def mark_as_complete(reminder_id):
	reminder = frappe.get_doc("Raven Reminder", reminder_id)

	reminder.is_complete = 1
	reminder.completed_at = now_datetime()

	reminder.save()

	toggle_like("Raven Message", reminder.message_id, "No")

	return "Mark as completed"
