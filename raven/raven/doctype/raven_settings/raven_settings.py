# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import json
import requests
import time
import firebase_admin
from firebase_admin import project_management
class RavenSettings(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		auto_add_system_users: DF.Check
		enable_push_notifications: DF.Check
		firebase_admin_credential: DF.JSON | None
		firebase_client_configuration: DF.JSON | None
		push_notification_method: DF.Literal["Self-managed FCM"]
		show_raven_on_desk: DF.Check
		vapid_public_key: DF.Data | None
	# end: auto-generated types

	def validate(self):
		'''
			Validate the FCM settings if present
		'''
		if self.enable_push_notifications:
			if self.push_notification_method == "Self-managed FCM":
				if not self.firebase_admin_credential:
					frappe.throw("Firebase Admin Credential is required for self-managed FCM")
				
				else:
					self.validate_admin_credentials()

	def validate_admin_credentials(self):
		'''
			Validate the firebase admin credentials
		'''			
		firebase_admin_json = json.loads(self.firebase_admin_credential)
		# Check if the firebase admin credential is valid
		credential = firebase_admin.credentials.Certificate(firebase_admin_json)
		# Initialize the firebase app
		app = firebase_admin.initialize_app(credential)

		# Check if the app is initialized
		try:
			project_management.list_android_apps(app)
			is_valid = True
		except Exception as e:
			is_valid = False
			frappe.throw(f"Invalid Firebase Admin Credential: {e}")
		finally:
			# Delete the app
			firebase_admin.delete_app(app)
		
		if not is_valid:
			frappe.throw("Invalid Firebase Admin Credential")

	def before_save(self):
		'''
			Before saving the settings, validate the FCM settings
		'''
		if self.enable_push_notifications and self.push_notification_method == "Self-managed FCM":
			self.generate_web_config()
	
	def after_save(self):
		'''
			Clear the cache
		'''
		frappe.cache().delete_value("raven_firebase_credentials")
		frappe.cache().delete_value("raven_firebase_project_id")


	def generate_web_config(self) -> str:
		# Generate firebase_client_configuration only if config is empty
		if not self.firebase_client_configuration:
			# generate access token
			credential = firebase_admin.credentials.Certificate(
				json.loads(self.firebase_admin_credential)
			)
			access_token_record = credential.get_access_token()
			# create web application
			url = (
				f"https://firebase.googleapis.com/v1beta1/projects/{credential.project_id}/webApps"
			)
			payload = {
				"displayName": 'raven',
			}
			headers = {
				"Authorization": f"Bearer {access_token_record.access_token}",
				"Content-Type": "application/json",
			}
			response = requests.post(url, data=json.dumps(payload), headers=headers)
			if response.status_code == 200:
				# save configuration
				response = response.json()
				operation_name = response["name"]
				firebase_application_id = ""
				# check operation status
				while True:
					url = f"https://firebase.googleapis.com/v1beta1/{operation_name}"
					headers = {
						"Authorization": f"Bearer {access_token_record.access_token}",
						"Content-Type": "application/json",
					}
					response = requests.get(url, headers=headers)
					if response.status_code == 200:
						response_json = response.json()
						if "done" in response_json and response_json["done"]:
							firebase_application_id = response_json["response"]["appId"]
							break
					time.sleep(5)

				if firebase_application_id == "":
					frappe.throw("Failed to register web app")

				# fetch web config
				url = f"https://firebase.googleapis.com/v1beta1/projects/{credential.project_id}/webApps/{firebase_application_id}/config"
				headers = {
					"Authorization": f"Bearer {access_token_record.access_token}",
					"Content-Type": "application/json",
				}
				response = requests.get(url, headers=headers)
				if response.status_code == 200:
					# save configuration
					response_json = response.json()
					self.firebase_client_configuration = json.dumps(response_json)
			else:
				frappe.throw("Failed to register web app")		
	pass
