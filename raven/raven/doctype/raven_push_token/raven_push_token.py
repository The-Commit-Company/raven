# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

from raven.api.notification import are_push_notifications_enabled


class RavenPushToken(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		device_information: DF.Data | None
		environment: DF.Literal["Web", "Mobile"]
		fcm_token: DF.SmallText
		user: DF.Link
	# end: auto-generated types

	def after_insert(self):
		"""
		If the push service is Frappe Cloud and is enabled, then send the token to the Frappe Cloud API
		"""
		push_service = self.get_push_service()

		if push_service == "Frappe Cloud" and are_push_notifications_enabled():
			try:
				from frappe.push_notification import subscribe

				subscribe(self.fcm_token, "raven")
			except ImportError:
				# push notifications are not supported in the current framework version
				pass
			except Exception:
				frappe.log_error("Failed to subscribe to Frappe Cloud push notifications")

	def on_trash(self):
		"""
		If the push service is Frappe Cloud and is enabled, then delete the token from the Frappe Cloud API
		"""
		push_service = self.get_push_service()

		if push_service == "Frappe Cloud" and are_push_notifications_enabled():
			try:
				from frappe.push_notification import unsubscribe

				unsubscribe(self.fcm_token, "raven")
			except ImportError:
				# push notifications are not supported in the current framework version
				pass
			except Exception:
				frappe.log_error("Failed to unsubscribe from Frappe Cloud push notifications")

	def get_push_service(self) -> str:
		"""
		Get the push service from the push service settings
		"""
		push_service = frappe.db.get_single_value("Raven Settings", "push_notification_service")

		if not push_service:
			push_service = "Frappe Cloud"

		return push_service
