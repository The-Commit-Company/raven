import frappe
from frappe import _

from raven.utils import get_raven_user


def _owned_reminder(reminder: str):
	"""Load a reminder, throwing PermissionError unless it belongs to the current user."""
	doc = frappe.get_doc("Raven Reminder", reminder)
	current = get_raven_user(frappe.session.user)
	if not current or doc.user != current:
		frappe.throw(_("You do not have access to this reminder."), frappe.PermissionError)
	return doc


@frappe.whitelist(methods=["POST"])
def create_reminder(message_id: str, remind_at: str, description: str | None = None) -> str:
	channel_id = frappe.db.get_value("Raven Message", message_id, "channel_id")
	if not channel_id:
		frappe.throw(_("Message not found."))
	if not frappe.has_permission("Raven Channel", doc=channel_id, ptype="read"):
		frappe.throw(_("You do not have access to this channel."), frappe.PermissionError)

	reminder = frappe.get_doc(
		{
			"doctype": "Raven Reminder",
			"message": message_id,
			"remind_at": remind_at,
			"description": description,
		}
	)
	reminder.insert()
	return reminder.name


@frappe.whitelist()
def get_reminders(status: str | None = "Scheduled") -> list[dict]:
	"""Current user's reminders, ordered by time.

	Defaults to Scheduled (pending) only — delivered reminders already appear as messages in the
	Reminder bot's DM, so listing Sent ones here would be redundant. Pass status=None for all, or
	a specific status (e.g. "Sent") to override.
	"""
	filters = {"user": get_raven_user(frappe.session.user)}
	if status:
		filters["status"] = status
	return frappe.get_all(
		"Raven Reminder",
		filters=filters,
		fields=["name", "message", "channel_id", "remind_at", "description", "status"],
		order_by="remind_at asc",
	)


@frappe.whitelist(methods=["POST"])
def snooze_reminder(reminder: str, remind_at: str) -> str:
	doc = _owned_reminder(reminder)
	doc.remind_at = remind_at
	doc.status = "Scheduled"
	doc.save()
	return doc.name


@frappe.whitelist(methods=["POST"])
def delete_reminder(reminder: str) -> None:
	_owned_reminder(reminder)
	frappe.delete_doc("Raven Reminder", reminder)
