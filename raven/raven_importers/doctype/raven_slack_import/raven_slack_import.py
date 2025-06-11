# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import datetime
import json
import os
import time
import zipfile

import frappe
from frappe.model.document import Document


class RavenSlackImport(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from raven.raven_importers.doctype.raven_slack_import_channels.raven_slack_import_channels import (
			RavenSlackImportChannels,
		)
		from raven.raven_importers.doctype.raven_slack_import_users.raven_slack_import_users import (
			RavenSlackImportUsers,
		)

		channels: DF.Table[RavenSlackImportChannels]
		channels_json_file: DF.Attach | None
		error_logs: DF.JSON | None
		slack_export_zip_file: DF.Attach
		status: DF.Literal["Not Started", "Staged", "In Progress", "Completed"]
		users: DF.Table[RavenSlackImportUsers]
		users_json_file: DF.Attach | None
	# end: auto-generated types

	def autoname(self):

		self.name = "Raven Slack Import at " + frappe.utils.now_datetime().strftime("%Y-%m-%d %H:%M:%S")

	@frappe.whitelist()
	def unzip_files(self):

		print("unzip_files")

		if not self.slack_export_zip_file.endswith(".zip"):
			frappe.throw("Please upload a zip file")

		zip_file_doc = frappe.get_doc("File", {"file_url": self.slack_export_zip_file})
		zip_path = zip_file_doc.get_full_path()

		with zipfile.ZipFile(zip_path) as z:
			for file in z.filelist:

				if file.is_dir() or file.filename.startswith("__MACOSX/"):
					# skip folders and macos hidden files
					continue

				filename = os.path.basename(file.filename)
				if filename.startswith("."):
					# skip hidden files
					continue

				if filename == "users.json":
					user_file_doc = frappe.new_doc("File")
					try:
						user_file_doc.content = z.read(file.filename)
					except zipfile.BadZipFile:
						frappe.throw("Invalid zip file")

					user_file_doc.file_name = filename
					user_file_doc.is_private = 1
					user_file_doc.attached_to_doctype = "Raven Slack Import"
					user_file_doc.attached_to_name = self.name
					user_file_doc.save()
					self.users_json_file = user_file_doc.file_url

				elif filename == "channels.json":
					channel_file_doc = frappe.new_doc("File")
					try:
						channel_file_doc.content = z.read(file.filename)
					except zipfile.BadZipFile:
						frappe.throw("Invalid zip file")

					channel_file_doc.file_name = filename
					channel_file_doc.is_private = 1
					channel_file_doc.attached_to_doctype = "Raven Slack Import"
					channel_file_doc.attached_to_name = self.name
					channel_file_doc.save()
					self.channels_json_file = channel_file_doc.file_url

		self.parse_users_json()
		self.parse_channels_json()

		self.status = "Staged"
		self.save()

	def parse_users_json(self):
		self.users = []
		if not self.users_json_file:
			frappe.throw("Users JSON file not found")

		users_json_file_doc = frappe.get_doc("File", {"file_url": self.users_json_file})
		users_json_path = users_json_file_doc.get_full_path()

		with open(users_json_path) as f:
			users_json = json.load(f)

		for user in users_json:
			# Check if we can map this user to an existing user
			existing_user = frappe.db.exists("Raven User", {"user": user.get("profile", {}).get("email")})
			self.append(
				"users",
				{
					"slack_user_id": user.get("id"),
					"slack_name": user.get("name"),
					"slack_real_name": user.get("real_name"),
					"first_name": user.get("profile", {}).get("first_name"),
					"last_name": user.get("profile", {}).get("last_name"),
					"email": user.get("profile", {}).get("email"),
					"is_bot": user.get("is_bot"),
					"raven_user": existing_user,
					"import_type": "Map to Existing User" if existing_user else "Create New User",
				},
			)

	def parse_channels_json(self):
		self.channels = []
		if not self.channels_json_file:
			frappe.throw("Channels JSON file not found")

		channels_json_file_doc = frappe.get_doc("File", {"file_url": self.channels_json_file})
		channels_json_path = channels_json_file_doc.get_full_path()

		with open(channels_json_path) as f:
			channels_json = json.load(f)

		workspaces = frappe.get_all("Raven Workspace")

		workspace = None

		if len(workspaces) == 1:
			workspace = workspaces[0].name

		for channel in channels_json:
			created_time_struct = time.localtime(channel.get("created"))

			self.append(
				"channels",
				{
					"slack_id": channel.get("id"),
					"slack_name": channel.get("name"),
					"slack_topic": channel.get("topic", {}).get("value", ""),
					"slack_purpose": channel.get("purpose", {}).get("value"),
					"slack_is_archived": channel.get("is_archived"),
					"slack_is_general": channel.get("is_general"),
					"members": json.dumps(channel.get("members")),
					"slack_creator_user_id": channel.get("creator"),
					"import_type": "Create New Channel",
					"channel_type": "Open" if channel.get("is_general") else "Public",
					"workspace": workspace,
					# Parse the created_on date from UNIX timestamp (in seconds) to datetime.datetime
					"created_on": datetime.datetime(
						year=created_time_struct.tm_year,
						month=created_time_struct.tm_mon,
						day=created_time_struct.tm_mday,
						hour=created_time_struct.tm_hour,
						minute=created_time_struct.tm_min,
						second=created_time_struct.tm_sec,
					),
				},
			)

	@frappe.whitelist()
	def start_import(self):
		"""
		Start the import process by creating all channels and users and then enqueing jobs for each channel's messages
		"""
		self.validate_users()
		self.validate_channels()

	def validate_users(self):
		for user in self.users:
			if user.import_type == "Create New User":
				if not user.email:
					frappe.throw("Email is required for new users")

				if not user.slack_real_name:
					frappe.throw("A name is required for new users")

			else:
				if not user.raven_user:
					frappe.throw(f"Please map the user {user.email} to an existing user")

	def validate_channels(self):
		for channel in self.channels:
			if channel.import_type == "Create New Channel":
				if not channel.slack_name:
					frappe.throw("Channel name is required for new channels")

				if not channel.raven_workspace:
					frappe.throw("Workspace is required for new channels")

			else:
				if not channel.raven_channel:
					frappe.throw(f"Please map the channel {channel.slack_name} to an existing channel")

	# def create_custom_fields(self):
	# 	"""
	# 	Create a "conversion_id" custom field in Raven User, Raven Channel, Raven Message to track duplicates
	# 	"""
