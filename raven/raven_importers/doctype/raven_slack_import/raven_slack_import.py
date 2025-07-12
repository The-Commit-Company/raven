# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import datetime
import json
import os
import zipfile

import emoji
import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields
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
		from raven.raven_importers.doctype.raven_slack_importer_emojis.raven_slack_importer_emojis import (
			RavenSlackImporterEmojis,
		)

		channels: DF.Table[RavenSlackImportChannels]
		channels_json_file: DF.Attach | None
		emojis: DF.Table[RavenSlackImporterEmojis]
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

		unique_emojis = set()

		for channel in channels_json:

			channel_messages = self.extract_channel_messages_json(channel.get("name"))

			for message in channel_messages:
				for e in message.get("reactions", []):
					unique_emojis.add(e.get("name"))

			# Save the channel messages to a JSON file
			channel_messages_file_doc = frappe.new_doc("File")
			channel_messages_file_doc.content = json.dumps(channel_messages)
			channel_messages_file_doc.file_name = f"{channel.get('id')}.json"
			channel_messages_file_doc.is_private = 1
			channel_messages_file_doc.attached_to_doctype = "Raven Slack Import"
			channel_messages_file_doc.attached_to_name = self.name
			channel_messages_file_doc.save()

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
					"created_on": convert_slack_timestamp_to_datetime(channel.get("created")),
					"number_of_messages": len(channel_messages),
					"channel_messages": channel_messages_file_doc.file_url,
				},
			)
		self.emojis = []
		for e in unique_emojis:
			is_custom = False
			mapped_emoji = get_emoji_from_name(e)
			if not mapped_emoji or mapped_emoji.startswith(":"):
				is_custom = True
			else:
				escaped_emoji = mapped_emoji.encode("unicode-escape").decode("utf-8").replace("\\u", "")

			self.append(
				"emojis",
				{
					"slack_emoji_name": e,
					"mapped_emoji": mapped_emoji,
					"is_custom": is_custom,
					"mapped_emoji_escaped": escaped_emoji,
				},
			)

	@frappe.whitelist()
	def start_import(self):
		"""
		Start the import process by creating all channels and users and then enqueing jobs for each channel's messages
		"""
		self.validate_users()
		self.validate_channels()

		# Create custom fields to keep track of duplicates
		self.create_custom_fields()

		# # Create/map users
		user_map = self.create_users()

		emoji_map = {}

		for e in self.emojis:
			emoji_map[e.slack_emoji_name] = {
				"mapped_emoji": e.mapped_emoji,
				"is_custom": e.is_custom,
				"mapped_emoji_escaped": e.mapped_emoji_escaped,
			}

		# # Create/map channels
		self.create_channels(user_map, emoji_map)

		# Create/map channels

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

	def extract_channel_messages_json(self, channel_id):
		"""
		Function to fetch all channel messages and prepare them for import
		"""

		# Open the zip file and get the messages from the channel folder
		# Each channel has a folder in the zip file called "channel_id" - we need to get all the JSON files in that folder and merge them
		zip_file_doc = frappe.get_doc("File", {"file_url": self.slack_export_zip_file})
		zip_path = zip_file_doc.get_full_path()

		channel_messages = []

		with zipfile.ZipFile(zip_path) as z:
			for file in z.filelist:
				if file.is_dir() or file.filename.startswith("__MACOSX/"):
					# skip folders and macos hidden files
					continue

				if f"/{channel_id}/" in file.filename and file.filename.endswith(".json"):

					# Read the JSON file and add it to the channel_messages list
					with z.open(file.filename) as f:
						channel_messages.extend(json.load(f))

		return channel_messages

	def create_custom_fields(self):
		"""
		Create a "conversion_id" custom field in Raven User, Raven Channel, Raven Message to track duplicates
		"""

		base_fields = [
			{
				"fieldname": "is_converted",
				"label": "Is Converted",
				"fieldtype": "Check",
			},
			{
				"fieldname": "conversion_id",
				"label": "Conversion ID",
				"fieldtype": "Data",
			},
		]

		create_custom_fields(
			{
				"Raven User": base_fields,
				"Raven Channel": base_fields,
				"Raven Message": base_fields,
			}
		)

	def create_users(self):
		"""
		Create users from the import data
		"""

		user_map = {}

		for user in self.users:
			if user.import_type == "Create New User":

				# Do not create user if it exists
				existing_user = frappe.db.exists("User", {"email": user.email})

				if not existing_user:
					user_doc = frappe.new_doc("User")
					user_doc.email = user.email
					user_doc.first_name = user.first_name
					user_doc.last_name = user.last_name
					user_doc.send_welcome_email = 0
					user_doc.add_roles("Raven User")
				else:
					user_doc = frappe.get_doc("User", existing_user)

				# Do not create Raven User if it already exists
				existing_raven_user = frappe.db.exists("Raven User", {"user": user_doc.name})

				if not existing_raven_user:
					# Else add the role and get the created Raven User
					user_doc.add_roles("Raven User")
					created_user = frappe.get_doc("Raven User", {"user": user_doc.name})
				else:
					# Get the created Raven User
					created_user = frappe.get_doc("Raven User", existing_raven_user)

				created_user.is_converted = 1
				created_user.conversion_id = user.slack_user_id
				created_user.flags.ignore_permissions = True
				created_user.save()

				user.raven_user = created_user.name

				user_map[user.slack_user_id] = created_user.name

			elif user.import_type == "Map to Existing User":
				existing_user = frappe.get_doc("Raven User", {"user": user.raven_user})
				existing_user.is_converted = 1
				existing_user.conversion_id = user.slack_user_id
				existing_user.flags.ignore_permissions = True
				existing_user.save()

				user_map[user.slack_user_id] = existing_user.name

		return user_map

	def create_channels(self, user_map, emoji_map):
		"""
		Create channels and channel members
		"""
		frappe.flags.in_import = True
		try:
			for channel in self.channels:
				if channel.import_type == "Create New Channel":

					channel_owner = frappe.session.user
					if channel.slack_creator_user_id:
						channel_owner = user_map.get(channel.slack_creator_user_id, None)

					if channel.raven_channel and frappe.db.exists("Raven Channel", channel.raven_channel):
						channel_doc = frappe.get_doc("Raven Channel", channel.raven_channel)
					else:

						channel_doc = frappe.new_doc("Raven Channel")
						channel_doc.creation = channel.created_on
						channel_doc.idx = 1
						channel_doc.modified = channel.created_on
						channel_doc.owner = channel_owner
						channel_doc.modified_by = channel_owner
						channel_doc.workspace = channel.raven_workspace
						channel_doc.type = channel.channel_type
						channel_doc.is_archived = channel.slack_is_archived
						channel_doc.is_converted = True
						channel_doc.conversion_id = channel.slack_id
						channel_doc.channel_name = channel.slack_name
						channel_doc.channel_description = channel.slack_purpose
						channel_doc.name = f"{channel.raven_workspace}-{channel.slack_name}"

						channel_doc.db_insert()

						channel_doc.reload()

					channel.raven_channel = channel_doc.name

					# Add the channel owner as a member
					channel_doc.add_members([channel_owner], is_admin=1)

					# Add the channel members
					channel_members = json.loads(channel.members)
					for member in channel_members:
						user_id = user_map.get(member, None)
						if user_id and user_id != channel_owner:
							channel_doc.add_members([user_id], is_admin=0)
		except Exception as e:
			frappe.flags.in_import = False
			frappe.throw(e)

		frappe.flags.in_import = False


# Utils
def convert_slack_timestamp_to_datetime(timestamp):
	"""
	Convert a Slack timestamp to a datetime object
	"""
	return datetime.datetime.fromtimestamp(timestamp)


def get_emoji_from_name(emoji_name: str):
	"""
	Get an emoji from the emoji name. Something like "expressionless" > "😑"
	"""
	return emoji.emojize(f":{emoji_name}:", language="alias")
