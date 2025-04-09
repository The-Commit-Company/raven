# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import secrets

from frappe.model.document import Document


class RavenIncomingWebhook(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		bot: DF.Link
		channel_id: DF.Link
		webhook_url: DF.ReadOnly | None
	# end: auto-generated types

	def autoname(self):
		self.name = f"{secrets.token_urlsafe(3 * 16)[:64]}"
