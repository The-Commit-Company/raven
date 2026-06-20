# Copyright (c) 2026, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import re
from urllib.parse import urljoin

import frappe
from frappe.model.document import Document
from linkpreview import Link, LinkGrabber, LinkPreview, link_preview


class RavenLinkPreview(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		description: DF.SmallText | None
		fetched_on: DF.Datetime | None
		image: DF.SmallText | None
		site_name: DF.Data | None
		title: DF.SmallText | None
		url: DF.Data
	# end: auto-generated types

	def fetch_preview(self):

		if frappe.flags.in_test or frappe.flags.in_patch or frappe.flags.in_migrate:
			return

		if not (
			self.url.startswith("mailto")
			or self.url.startswith("tel")
			or re.match(r"http://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.*", self.url)
			or re.match(r"https://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.*", self.url)
			or re.match(r"http://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", self.url)
			or re.match(r"https://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", self.url)
		):
			preview = None
			try:
				# If this is a Twitter/X URL, then we need to fetch the preview from the Twitter API
				# This is because the linkpreview library doesn't support Twitter previews with the default bot
				if "twitter.com" in self.url or "x.com" in self.url:
					grabber = LinkGrabber()
					content, url_fetched = grabber.get_content(self.url, headers="imessagebot")
					link = Link(url_fetched, content)
					preview = LinkPreview(link)
				else:
					preview = link_preview(self.url)
			except Exception:
				preview = None
				pass
			if preview:
				self.title = (preview.title or "")[:140]
				self.description = preview.description
				self.site_name = (preview.site_name or "")[:140]

				if preview.image:
					self.image = urljoin(self.url, preview.image)

				self.fetched_on = frappe.utils.now_datetime()

	def before_insert(self):
		self.fetch_preview()
