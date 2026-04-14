import json
import re

import frappe
from frappe import _
from frappe.utils.background_jobs import enqueue, is_job_enqueued
from linkpreview import Link, LinkGrabber, LinkPreview, link_preview

from raven.utils import get_raven_room


@frappe.whitelist(methods=["GET"])
def get_preview_link(urls: list[str] | str):

	data = {}
	empty_data = {
		"title": "",
		"description": "",
		"image": "",
		"force_title": "",
		"absolute_image": "",
		"site_name": "",
	}
	message_links = []

	if urls and urls != "[]":
		urls = json.loads(urls)

		for url in urls:
			data = frappe.cache().get_value(url)
			if data == None:
				# Don't try to preview insecure links like IP addresses
				# If URL is an IP address, or starts with mailto or tel, don't preview. Just return empty data
				if (
					url.startswith("mailto")
					or url.startswith("tel")
					or re.match(r"http://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.*", url)
					or re.match(r"https://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.*", url)
					or re.match(r"http://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", url)
					or re.match(r"https://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", url)
				):
					data = empty_data
				else:
					preview = None
					try:
						# If this is a Twitter/X URL, then we need to fetch the preview from the Twitter API
						# This is because the linkpreview library doesn't support Twitter previews with the default bot
						if "twitter.com" in url or "x.com" in url:
							grabber = LinkGrabber()
							content, url_fetched = grabber.get_content(url, headers="imessagebot")
							link = Link(url_fetched, content)
							preview = LinkPreview(link)
						else:
							preview = link_preview(url)
					except Exception:
						preview = None
						pass
					if preview == None:
						data = empty_data
					else:

						# Description might have emojis in them, which comes in with special characters like copyright etc
						# TODO: We need to replace these special characters with the actual emojis

						data = {
							"title": preview.title,
							"description": preview.description,
							"image": preview.image,
							"force_title": preview.force_title,
							"absolute_image": preview.absolute_image,
							"site_name": preview.site_name,
						}
					frappe.cache().set_value(url, data)
			message_links.append(data)

	return message_links


@frappe.whitelist(methods=["POST"])
def hide_link_preview(message_id: str):
	"""
	Remove the preview from the message
	"""
	message = frappe.get_doc("Raven Message", message_id)

	if not message.has_permission():
		frappe.throw(_("You do not have permission to hide link previews on this message."))

	message.flags.ignore_permissions = True
	message.hide_link_preview = 1
	message.flags.editing_metadata = True
	message.save()


@frappe.whitelist(methods=["POST"])
def update_link_previews_in_background(urls: list[str] | str, channel_id: str | None = None):
	job_id = "update_link_previews"
	if not is_job_enqueued(job_id):
		enqueue(
			method=update_link_previews, urls=urls, channel_id=channel_id, job_name="update_link_previews"
		)
	else:
		frappe.log_error("Update preview links job is already running")


def update_link_previews(urls: list[str] | str, channel_id: str | None = None):
	if isinstance(urls, str) and urls != "[]":
		urls = json.loads(urls)

	from raven.api.search import RavenSearch

	search = RavenSearch()
	reindexed_messages = set()

	for url in urls:
		try:
			preview_doc = frappe.get_doc("Raven Link Preview", url)
			preview_doc.fetch_preview()
			preview_doc.save()

			# Re-index all messages that reference this URL
			linked_messages = frappe.get_all(
				"Raven Message Links", filters={"url": url, "parenttype": "Raven Message"}, pluck="parent"
			)
			for message_name in linked_messages:
				if message_name not in reindexed_messages:
					reindexed_messages.add(message_name)
					search.index_doc("Raven Message", message_name)

		except Exception:
			frappe.log_error(f"Failed to update preview for {url}")

	if channel_id:
		frappe.publish_realtime(
			"link_previews_updated", {"channel_id": channel_id}, room=get_raven_room()
		)
