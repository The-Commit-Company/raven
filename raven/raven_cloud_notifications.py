import json
from urllib.parse import urlparse

import frappe
from frappe.frappeclient import FrappeClient

# ----- Utility Functions -----


def get_site_name():
	return urlparse(frappe.utils.get_url()).hostname


# ----- Token Management -----


def add_token_to_raven_cloud(user_id, token):
	"""
	Add a token to Raven Cloud
	"""
	raven_settings = frappe.get_single("Raven Settings")

	client = FrappeClient(
		url=raven_settings.push_notification_server_url,
		api_key=raven_settings.push_notification_api_key,
		api_secret=raven_settings.get_password("push_notification_api_secret"),
	)

	client.post_api(
		"raven_cloud.api.notification.create_user_token",
		params={
			"user_id": user_id,
			"token": token,
			"site_name": get_site_name(),
		},
	)


def delete_token_from_raven_cloud(user_id, token):
	"""
	Delete a token from Raven Cloud
	"""
	raven_settings = frappe.get_single("Raven Settings")

	client = FrappeClient(
		url=raven_settings.push_notification_server_url,
		api_key=raven_settings.push_notification_api_key,
		api_secret=raven_settings.get_password("push_notification_api_secret"),
	)

	client.post_api(
		"raven_cloud.api.notification.delete_user_token",
		params={
			"user_id": user_id,
			"token": token,
			"site_name": get_site_name(),
		},
	)
