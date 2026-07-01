import frappe
from frappe import _
from frappe.utils.data import now_datetime

REMINDER_BOT_NAME = "Raven Reminder"

# Max reminders delivered per minute-ly sweep. Bounds one sweep's work (and its DB transactions)
# so a backlog — possible since delivery is late-tolerant with no lower time bound — can't trigger
# one huge run. Any overflow is the oldest-first remainder, picked up by the next sweep a minute later.
REMINDER_BATCH_SIZE = 500


def get_reminder_bot():
	"""Idempotent get-or-create of the Reminder bot. Returns the bot doc with raven_user set.

	Provisioned imperatively (called from after_install + after_migrate) rather than shipped as a
	standard bot, because Raven does not yet have "standard bot" functionality. Raven Bot has the
	is_standard + module fields, but the export-to-JSON-on-save half is unimplemented (see the TODO
	in raven_bot.py:on_update), and "Raven Bot" is not registered via the importable_doctypes hook,
	so standard bots are NOT auto-synced on migrate. Until that lands, this get-or-create matches
	Raven's existing convention for default records (see create_general_channel /
	create_raven_user_for_administrator in install.py). When standard bots are implemented, this
	helper and its two hook calls can be replaced by shipping the bot's JSON.
	"""
	if frappe.db.exists("Raven Bot", REMINDER_BOT_NAME):
		return frappe.get_doc("Raven Bot", REMINDER_BOT_NAME)

	bot = frappe.get_doc(
		{
			"doctype": "Raven Bot",
			"bot_name": REMINDER_BOT_NAME,
			"description": "Sends you reminders about messages you asked to be reminded of.",
			# Marks intent for the future standard-bot mechanism; a no-op today (see docstring).
			"is_standard": 1,
		}
	)
	bot.insert(ignore_permissions=True)
	bot.reload()  # raven_user is populated by the bot's on_update
	return bot


def send_due_reminders():
	"""Cron entrypoint: deliver every Scheduled reminder whose time has arrived.

	No lower time bound: a reminder overdue by hours (e.g. after a scheduler outage)
	still fires on the next sweep. Late delivery beats silently dropping it.
	"""
	due = frappe.get_all(
		"Raven Reminder",
		filters=[
			["status", "=", "Scheduled"],
			["remind_at", "<=", now_datetime()],
		],
		pluck="name",
		order_by="remind_at asc",  # oldest-overdue first when capped
		limit_page_length=REMINDER_BATCH_SIZE,
	)

	if not due:
		return

	bot = get_reminder_bot()
	for name in due:
		try:
			deliver_reminder(name, bot)
			frappe.db.commit()
		except Exception:
			frappe.db.rollback()
			frappe.log_error(title=f"Failed to send Raven reminder {name}", message=frappe.get_traceback())


def deliver_reminder(name, bot):
	"""DM the user a forwarded copy of the source message (+ optional note), then mark Sent."""
	reminder = frappe.get_doc("Raven Reminder", name)

	# Raven User -> underlying frappe user id, which create_direct_message_channel expects.
	user_id = frappe.db.get_value("Raven User", reminder.user, "user")
	if not user_id:
		frappe.throw(f"Raven User {reminder.user!r} has no linked frappe User")

	# Source message may have been deleted since the reminder was set. Mark Sent (so we don't
	# retry forever) and skip delivery.
	source = frappe.db.get_value(
		"Raven Message",
		reminder.message,
		["text", "content", "message_type", "file"],
		as_dict=True,
	)
	if not source:
		frappe.log_error(
			title=f"Raven Reminder {name}: source message deleted",
			message=f"Reminder {name} references missing Raven Message {reminder.message}",
		)
		reminder.db_set("status", "Sent", update_modified=False)
		return

	# Re-check the user can still read the source channel — they may have lost access between
	# setting the reminder and now. Don't leak content from a channel they can no longer see.
	if not frappe.has_permission(
		"Raven Channel", doc=reminder.channel_id, ptype="read", user=user_id
	):
		frappe.log_error(
			title=f"Raven Reminder {name}: user lost channel access",
			message=f"User {user_id} can no longer read channel {reminder.channel_id}",
		)
		reminder.db_set("status", "Sent", update_modified=False)
		return

	channel_id = bot.create_direct_message_channel(user_id)

	# Optional reminder note, as a short bot text message preceding the forwarded copy.
	if reminder.description:
		frappe.get_doc(
			{
				"doctype": "Raven Message",
				"channel_id": channel_id,
				"text": f"<p>⏰ {_('Reminder')}: {frappe.utils.escape_html(reminder.description)}</p>",
				"message_type": "Text",
				"is_bot_message": 1,
				"bot": bot.raven_user,
			}
		).insert(ignore_permissions=True)

	# Forward-copy of the source message. linked_message is intra-channel only, so we copy the
	# content and mark is_forwarded (mirrors raven_message.add_forwarded_message_to_channel).
	# Poll messages cannot be forwarded as Poll type because poll_id has a unique constraint —
	# each Raven Poll can only be attached to one message. Forward polls as Text using the
	# poll's content (question + options already stored there by create_poll).
	file_url = source.file.split("?")[0] if source.file else None
	is_poll = source.message_type == "Poll"
	frappe.get_doc(
		{
			"doctype": "Raven Message",
			"channel_id": channel_id,
			"text": source.text,
			"content": source.content,
			"message_type": "Text" if is_poll else (source.message_type or "Text"),
			"file": file_url,
			"is_forwarded": 1,
			"is_bot_message": 1,
			"bot": bot.raven_user,
		}
	).insert(ignore_permissions=True)

	reminder.db_set("status", "Sent", update_modified=False)
