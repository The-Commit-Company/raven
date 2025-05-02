# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

from raven.api.notification import are_push_notifications_enabled
from raven.notification import (
	clear_push_tokens_for_channel_cache,
	clear_push_tokens_for_user_cache,
)


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
		self.invalidate_cache()

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

	def on_update(self):
		"""
		Invalidate the cache when the push token is updated
		"""
		self.invalidate_cache()

	def on_trash(self):
		"""
		If the push service is Frappe Cloud and is enabled, then delete the token from the Frappe Cloud API
		"""
		self.invalidate_cache()

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

	def invalidate_cache(self):
		"""
		We need to invalidate the cache for the user and channels where the user is a member
		"""
		clear_push_tokens_for_user_cache(self.user)
		# Clear the cache for the channel if the user is a member of the channel
		channel_member = frappe.qb.DocType("Raven Channel Member")
		raven_user = frappe.qb.DocType("Raven User")

		query = (
			frappe.qb.from_(channel_member)
			.left_join(raven_user)
			.on(channel_member.user_id == raven_user.name)
			.where(raven_user.user == self.user)
			.select(channel_member.channel_id)
		)

		channel_ids = query.run(as_list=True)

		for channel_id in channel_ids:
			clear_push_tokens_for_channel_cache(channel_id)

	def get_push_service(self) -> str:
		"""
		Get the push service from the push service settings
		"""
		push_service = frappe.db.get_single_value("Raven Settings", "push_notification_service")

		if not push_service:
			push_service = "Frappe Cloud"

		return push_service
