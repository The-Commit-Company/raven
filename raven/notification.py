import frappe


def send_notification_to_user(user_id, title, message, data=None, user_image_id=None):
	"""
	Send a push notification to a user
	"""

	try:
		from frappe.push_notification import PushNotification

		push_notification = PushNotification("raven")

		if push_notification.is_enabled():
			icon_url = None
			if user_image_id:
				icon = frappe.get_cached_value("Raven User", user_image_id, "user_image")
				icon_url = frappe.utils.get_url() + icon
			push_notification.send_notification_to_user(
				user_id=user_id, title=title, body=message, icon=icon_url, data=data
			)
	except ImportError:
		# push notifications are not supported in the current framework version
		pass
	except Exception:
		frappe.log_error(frappe.get_traceback())
