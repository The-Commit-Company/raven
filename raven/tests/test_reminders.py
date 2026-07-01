import frappe
from frappe.tests import IntegrationTestCase
from frappe.utils import add_to_date, get_datetime, now_datetime

from raven.utils import get_raven_user


class TestReminders(IntegrationTestCase):
	def setUp(self):
		frappe.set_user("Administrator")

		# Ensure the test user has the Raven User role and a Raven User record
		user = frappe.get_doc("User", "test@example.com")
		user.add_roles("Raven User")

		# Ensure a Raven User record exists for test@example.com
		if not frappe.db.exists("Raven User", {"user": "test@example.com"}):
			frappe.get_doc(
				{
					"doctype": "Raven User",
					"user": "test@example.com",
					"type": "User",
					"enabled": 1,
				}
			).insert(ignore_permissions=True)

		frappe.set_user("test@example.com")
		self.raven_user = get_raven_user("test@example.com")
		self.channel, self.message = _make_channel_and_message(self.raven_user)

	def tearDown(self):
		frappe.db.rollback()
		frappe.set_user("Administrator")
		frappe.clear_cache()

	def _make_reminder(self, remind_at, description="Follow up"):
		return frappe.get_doc(
			{
				"doctype": "Raven Reminder",
				"message": self.message,
				"remind_at": remind_at,
				"description": description,
			}
		).insert()

	def test_validate_forces_user_and_derives_channel(self):
		future = add_to_date(now_datetime(), hours=1, as_string=True, as_datetime=True)
		reminder = self._make_reminder(future)
		self.assertEqual(reminder.user, self.raven_user)
		self.assertEqual(reminder.channel_id, self.channel)
		self.assertEqual(reminder.status, "Scheduled")

	def test_validate_rejects_past(self):
		past = add_to_date(now_datetime(), hours=-1, as_string=True, as_datetime=True)
		with self.assertRaises(frappe.ValidationError):
			self._make_reminder(past)

	def test_get_reminder_bot_is_idempotent(self):
		from raven.scheduler.send_reminders import REMINDER_BOT_NAME, get_reminder_bot

		frappe.set_user("Administrator")
		bot1 = get_reminder_bot()
		bot2 = get_reminder_bot()
		self.assertEqual(bot1.name, REMINDER_BOT_NAME)
		self.assertEqual(bot1.name, bot2.name)
		self.assertTrue(bot1.raven_user)
		self.assertEqual(frappe.db.count("Raven Bot", {"bot_name": REMINDER_BOT_NAME}), 1)

	def test_sweep_delivers_due_reminder_once(self):
		from raven.scheduler.send_reminders import (
			REMINDER_BOT_NAME,
			get_reminder_bot,
			send_due_reminders,
		)

		past_due = add_to_date(now_datetime(), minutes=-1, as_string=True, as_datetime=True)
		# Build via db so validate's "no past dates" rule doesn't block the fixture.
		reminder = frappe.get_doc(
			{
				"doctype": "Raven Reminder",
				"user": self.raven_user,
				"message": self.message,
				"channel_id": self.channel,
				"remind_at": past_due,
				"description": "Ping me",
				"status": "Scheduled",
			}
		)
		reminder.flags.ignore_validate = True
		reminder.insert(ignore_permissions=True)

		# Ensure bot exists before querying its raven_user (tearDown rolls back between tests).
		frappe.set_user("Administrator")
		bot = get_reminder_bot()
		bot_user = bot.raven_user

		# send_due_reminders() commits per reminder, so tearDown's rollback does NOT undo
		# delivered messages — assert on the COUNT DELTA, which survives prior runs' leftovers.
		def fwd_count():
			return frappe.db.count("Raven Message", {"bot": bot_user, "is_forwarded": 1})

		before = fwd_count()
		send_due_reminders()

		self.assertEqual(frappe.db.get_value("Raven Reminder", reminder.name, "status"), "Sent")
		self.assertEqual(fwd_count(), before + 1)  # exactly one forwarded copy delivered

		# Idempotent: a second sweep delivers nothing more (reminder is now Sent).
		send_due_reminders()
		self.assertEqual(fwd_count(), before + 1)

	def test_sweep_skips_future_reminders(self):
		from raven.scheduler.send_reminders import send_due_reminders

		future = add_to_date(now_datetime(), hours=2, as_string=True, as_datetime=True)
		reminder = self._make_reminder(future)

		frappe.set_user("Administrator")
		send_due_reminders()

		self.assertEqual(frappe.db.get_value("Raven Reminder", reminder.name, "status"), "Scheduled")

	def test_sweep_delivers_reminder_without_description(self):
		from raven.scheduler.send_reminders import (
			REMINDER_BOT_NAME,
			get_reminder_bot,
			send_due_reminders,
		)

		past_due = add_to_date(now_datetime(), minutes=-1, as_string=True, as_datetime=True)
		reminder = frappe.get_doc(
			{
				"doctype": "Raven Reminder",
				"user": self.raven_user,
				"message": self.message,
				"channel_id": self.channel,
				"remind_at": past_due,
				"status": "Scheduled",
			}
		)
		reminder.flags.ignore_validate = True
		reminder.insert(ignore_permissions=True)

		frappe.set_user("Administrator")
		bot_user = get_reminder_bot().raven_user

		def fwd_count():
			return frappe.db.count("Raven Message", {"bot": bot_user, "is_forwarded": 1})

		before = fwd_count()
		send_due_reminders()

		self.assertEqual(frappe.db.get_value("Raven Reminder", reminder.name, "status"), "Sent")
		self.assertEqual(fwd_count(), before + 1)  # forwarded copy delivered even with no note

	def test_create_and_list_reminder(self):
		from raven.api.reminders import create_reminder, get_reminders

		future = add_to_date(now_datetime(), hours=1, as_string=True, as_datetime=True)
		name = create_reminder(self.message, future, description="Review PR")

		rows = get_reminders()
		self.assertIn(name, [r["name"] for r in rows])
		row = next(r for r in rows if r["name"] == name)
		self.assertEqual(row["channel_id"], self.channel)
		self.assertEqual(row["status"], "Scheduled")

	def test_get_reminders_excludes_sent_by_default(self):
		from raven.api.reminders import create_reminder, get_reminders

		future = add_to_date(now_datetime(), hours=1, as_string=True, as_datetime=True)
		scheduled = create_reminder(self.message, future, description="pending")
		sent = create_reminder(self.message, future, description="delivered")
		frappe.db.set_value("Raven Reminder", sent, "status", "Sent")

		default_names = [r["name"] for r in get_reminders()]
		self.assertIn(scheduled, default_names)
		self.assertNotIn(sent, default_names)  # Sent hidden by default (shown in bot DM instead)

		all_names = [r["name"] for r in get_reminders(status=None)]
		self.assertIn(scheduled, all_names)
		self.assertIn(sent, all_names)  # explicit override returns everything

	def test_snooze_rearms_reminder(self):
		from raven.api.reminders import snooze_reminder

		future = add_to_date(now_datetime(), hours=1, as_string=True, as_datetime=True)
		reminder = self._make_reminder(future)
		frappe.db.set_value("Raven Reminder", reminder.name, "status", "Sent")

		later = add_to_date(now_datetime(), hours=3, as_string=True, as_datetime=True)
		snooze_reminder(reminder.name, later)

		self.assertEqual(frappe.db.get_value("Raven Reminder", reminder.name, "status"), "Scheduled")
		self.assertEqual(
			get_datetime(frappe.db.get_value("Raven Reminder", reminder.name, "remind_at")),
			get_datetime(later),
		)

	def test_cannot_snooze_or_delete_others_reminder(self):
		from raven.api.reminders import delete_reminder, snooze_reminder

		future = add_to_date(now_datetime(), hours=1, as_string=True, as_datetime=True)
		reminder = self._make_reminder(future)

		frappe.set_user("Administrator")
		# Ensure test1@example.com has a Raven User record and the Raven User role
		if not frappe.db.exists("Raven User", {"user": "test1@example.com"}):
			frappe.get_doc(
				{
					"doctype": "Raven User",
					"user": "test1@example.com",
					"type": "User",
					"enabled": 1,
				}
			).insert(ignore_permissions=True)
		frappe.get_doc("User", "test1@example.com").add_roles("Raven User")

		original_user = frappe.session.user
		try:
			frappe.set_user("test1@example.com")
			later = add_to_date(now_datetime(), hours=2, as_string=True, as_datetime=True)
			with self.assertRaises(frappe.PermissionError):
				snooze_reminder(reminder.name, later)
			with self.assertRaises(frappe.PermissionError):
				delete_reminder(reminder.name)
		finally:
			frappe.set_user(original_user)

	def test_delete_reminder(self):
		from raven.api.reminders import delete_reminder

		future = add_to_date(now_datetime(), hours=1, as_string=True, as_datetime=True)
		reminder = self._make_reminder(future)
		delete_reminder(reminder.name)
		self.assertFalse(frappe.db.exists("Raven Reminder", reminder.name))

	def test_sweep_delivers_stale_reminder(self):
		from raven.scheduler.send_reminders import (
			REMINDER_BOT_NAME,
			get_reminder_bot,
			send_due_reminders,
		)

		stale = add_to_date(now_datetime(), hours=-3, as_string=True, as_datetime=True)
		reminder = frappe.get_doc(
			{
				"doctype": "Raven Reminder",
				"user": self.raven_user,
				"message": self.message,
				"channel_id": self.channel,
				"remind_at": stale,
				"status": "Scheduled",
			}
		)
		reminder.flags.ignore_validate = True
		reminder.insert(ignore_permissions=True)

		frappe.set_user("Administrator")
		bot_user = get_reminder_bot().raven_user

		def fwd_count():
			return frappe.db.count("Raven Message", {"bot": bot_user, "is_forwarded": 1})

		before = fwd_count()
		send_due_reminders()

		self.assertEqual(frappe.db.get_value("Raven Reminder", reminder.name, "status"), "Sent")
		self.assertEqual(fwd_count(), before + 1)  # overdue-by-hours reminder still delivered

	def _make_poll_message(self):
		"""Create a valid Poll message in self.channel and return its Raven Message name."""
		# Use the real create_poll path so validation runs end-to-end.
		from raven.api.raven_poll import create_poll

		poll_id = create_poll(
			channel_id=self.channel,
			question="Test poll question?",
			options=[{"option": "Option A"}, {"option": "Option B"}],
		)
		# create_poll inserts the Raven Message internally; find it by poll_id.
		msg_name = frappe.db.get_value("Raven Message", {"poll_id": poll_id}, "name")
		if not msg_name:
			frappe.throw(f"Poll message not found for poll {poll_id}")
		return msg_name

	def test_sweep_delivers_poll_reminder(self):
		from raven.scheduler.send_reminders import (
			REMINDER_BOT_NAME,
			get_reminder_bot,
			send_due_reminders,
		)

		poll_message = self._make_poll_message()  # implement this helper; see below

		past_due = add_to_date(now_datetime(), minutes=-1, as_string=True, as_datetime=True)
		reminder = frappe.get_doc(
			{
				"doctype": "Raven Reminder",
				"user": self.raven_user,
				"message": poll_message,
				"channel_id": self.channel,
				"remind_at": past_due,
				"status": "Scheduled",
			}
		)
		reminder.flags.ignore_validate = True
		reminder.insert(ignore_permissions=True)

		frappe.set_user("Administrator")
		bot_user = get_reminder_bot().raven_user

		def fwd_count():
			return frappe.db.count("Raven Message", {"bot": bot_user, "is_forwarded": 1})

		before = fwd_count()
		send_due_reminders()  # must NOT raise on the poll message

		self.assertEqual(frappe.db.get_value("Raven Reminder", reminder.name, "status"), "Sent")
		self.assertEqual(fwd_count(), before + 1)

	def test_sweep_skips_when_user_cannot_read_channel(self):
		from raven.scheduler.send_reminders import get_reminder_bot, send_due_reminders

		frappe.set_user("Administrator")
		# A private channel the test user is NOT a member of.
		private_channel = frappe.get_doc(
			{
				"doctype": "Raven Channel",
				"channel_name": frappe.generate_hash("test-private", 8),
				"workspace": frappe.db.get_value("Raven Channel", self.channel, "workspace"),
				"type": "Private",
			}
		).insert(ignore_permissions=True)
		secret_message = frappe.get_doc(
			{
				"doctype": "Raven Message",
				"channel_id": private_channel.name,
				"text": "<p>secret</p>",
				"message_type": "Text",
			}
		).insert(ignore_permissions=True)

		reminder = frappe.get_doc(
			{
				"doctype": "Raven Reminder",
				"user": self.raven_user,
				"message": secret_message.name,
				"channel_id": private_channel.name,
				"remind_at": add_to_date(now_datetime(), minutes=-1, as_string=True, as_datetime=True),
				"status": "Scheduled",
			}
		)
		reminder.flags.ignore_validate = True
		reminder.insert(ignore_permissions=True)

		bot_user = get_reminder_bot().raven_user

		def fwd_count():
			return frappe.db.count("Raven Message", {"bot": bot_user, "is_forwarded": 1})

		before = fwd_count()
		send_due_reminders()

		# Skipped: marked Sent (so it doesn't loop), but NO content forwarded.
		self.assertEqual(frappe.db.get_value("Raven Reminder", reminder.name, "status"), "Sent")
		self.assertEqual(fwd_count(), before)


def _make_channel_and_message(raven_user):
	"""Create a workspace + public channel, plus one message to anchor reminders on."""
	workspace = frappe.get_doc(
		{
			"doctype": "Raven Workspace",
			"workspace_name": frappe.generate_hash("test-reminder-ws", 8),
			"type": "Public",
		}
	).insert(ignore_permissions=True)
	channel = frappe.get_doc(
		{
			"doctype": "Raven Channel",
			"channel_name": frappe.generate_hash("test-rem", 8),
			"workspace": workspace.name,
			"type": "Public",
		}
	).insert(ignore_permissions=True)
	message = frappe.get_doc(
		{
			"doctype": "Raven Message",
			"channel_id": channel.name,
			"text": "<p>anchor</p>",
			"message_type": "Text",
		}
	).insert(ignore_permissions=True)
	return channel.name, message.name
