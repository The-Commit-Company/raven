import frappe
from frappe import _
from frappe.frappeclient import FrappeClient

from raven.raven_cloud_notifications import get_site_name


def sync_invalid_tokens():
	"""
	This function is used to fetch the invalid tokens from Raven Cloud and sync them to the database.
	It runs a loop to fetch the Invalid tokens in batches of 100 from Raven Cloud and deletes them from the database.
	If has_more is true, it will continue to fetch the next batch of tokens.
	If has_more is false, it will break the loop. If there are no invalid tokens or error in fetching the invalid tokens, it will break the loop.
	"""
	from raven.utils import make_api_call

	raven_settings = frappe.get_single("Raven Settings")

	url = f"{raven_settings.push_notification_server_url}/api/method/raven_cloud.api.notification.sync_invalid_tokens"

	batch_size = 100

	site_name = get_site_name()

	while True:
		try:
			response = make_api_call(
				url=url,
				api_key=raven_settings.push_notification_api_key,
				api_secret=raven_settings.get_password("push_notification_api_secret"),
				method="POST",
				params={
					"site_name": site_name,
					"batch_size": batch_size,
				},
			)
			message = response.get("message")

			invalid_tokens = message.get("invalid_tokens", [])

			if not invalid_tokens:
				break

			for token_data in invalid_tokens:
				try:
					frappe.db.delete("Raven Push Token", {"fcm_token": token_data.get("invalid_token")})
				except Exception as e:
					frappe.log_error(
						_(f"Failed to delete local token {token_data.get('invalid_token')}: {str(e)}")
					)

			# Check if more tokens exist
			has_more = message.get("has_more", False)
			if not has_more:
				break

		except Exception as e:
			frappe.log_error(_(f"Failed to sync invalid tokens: {str(e)}"))
			break

	return "Invalid tokens synced successfully"
