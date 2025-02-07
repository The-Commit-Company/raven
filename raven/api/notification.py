import frappe
from frappe import _


@frappe.whitelist()
def are_push_notifications_enabled() -> bool:
	try:
		return frappe.db.get_single_value("Push Notification Settings", "enable_push_notification_relay")
	except frappe.DoesNotExistError:
		# push notifications are not supported in the current framework version
		return False


@frappe.whitelist(methods=["POST"])
def toggle_push_notification_for_channel(member: str, allow_notifications: 0 | 1) -> None:
	if are_push_notifications_enabled():
		member_doc = frappe.get_doc("Raven Channel Member", member)
		if member_doc:
			member_doc.allow_notifications = allow_notifications
			member_doc.save()

			return member_doc
	else:
		frappe.throw(_("Push notifications are not supported in the current framework version"))


@frappe.whitelist(methods=["POST"])
def subscribe(fcm_token: str, environment: str, device_information: str | None = None) -> None:
	"""
	Add the FCM token to the database
	"""

	# Check if the FCM token already exists
	if frappe.db.exists("Raven Push Token", {"fcm_token": fcm_token, "user": frappe.session.user}):
		return

	# Add the FCM token to the database
	frappe.get_doc(
		{
			"doctype": "Raven Push Token",
			"fcm_token": fcm_token,
			"user": frappe.session.user,
			"environment": environment,
			"device_information": device_information,
		}
	).insert()

	return "Subscribed"


@frappe.whitelist(methods=["POST"])
def unsubscribe(fcm_token: str) -> None:
	"""
	Remove the FCM token from the database
	"""

	frappe.db.delete("Raven Push Token", {"fcm_token": fcm_token, "user": frappe.session.user})

	return "Unsubscribed"
