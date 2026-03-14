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


def sync_users_tokens_to_raven_cloud():
	"""
	Sync all the tokens available on this site to Raven Cloud
	"""
	raven_settings = frappe.get_single("Raven Settings")
	tokens = frappe.db.get_all("Raven Push Token", fields=["user", "fcm_token"], order_by="user")

	# Group tokens by user to ensure all tokens for a user are in the same chunk
	user_tokens = {}
	for token in tokens:
		user_tokens.setdefault(token["user"], []).append(token)

		# Build chunks where all tokens for a user stay together
	chunks = []
	current_chunk = []
	for user, user_token_list in user_tokens.items():
		if len(current_chunk) + len(user_token_list) > 10 and current_chunk:
			chunks.append(current_chunk)
			current_chunk = []
		current_chunk.extend(user_token_list)
	if current_chunk:
		chunks.append(current_chunk)

	for chunk in chunks:
		client = FrappeClient(
			url=raven_settings.push_notification_server_url,
			api_key=raven_settings.push_notification_api_key,
			api_secret=raven_settings.get_password("push_notification_api_secret"),
		)

		client.post_api(
			"raven_cloud.api.notification.import_user_tokens",
			params={
				"site_name": get_site_name(),
				"tokens": json.dumps(chunk),
			},
		)
