# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class RavenSlackImportChannels(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		channel_type: DF.Literal["Open", "Public", "Private"]
		created_on: DF.Datetime | None
		import_type: DF.Literal["Map To Existing Channel", "Create New Channel"]
		members: DF.JSON | None
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		raven_channel: DF.Link | None
		raven_workspace: DF.Link | None
		slack_creator_user_id: DF.Data | None
		slack_id: DF.Data
		slack_is_archived: DF.Check
		slack_is_general: DF.Check
		slack_name: DF.Data | None
		slack_purpose: DF.Data | None
		slack_topic: DF.Data | None
	# end: auto-generated types

	pass
