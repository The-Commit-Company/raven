# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class RavenSlackImporterEmojis(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		is_custom: DF.Check
		mapped_emoji: DF.Data | None
		mapped_emoji_escaped: DF.Data | None
		parent: DF.Data
		parentfield: DF.Data
		parenttype: DF.Data
		slack_emoji_name: DF.Data
	# end: auto-generated types

	pass
