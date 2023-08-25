import frappe
from linkpreview import link_preview
import json


@frappe.whitelist()
def get_preview_link(urls):

    data = {}
    message_links = []

    if urls and urls != '[]':
        urls = json.loads(urls)
        for url in urls:
            data = frappe.cache().get_value(url)
            if data == None:
                preview = link_preview(url)
                data = {
                    "title": preview.title,
                    "description": preview.description,
                    "image": preview.image,
                    "force_title": preview.force_title,
                    "absolute_image": preview.absolute_image,
                    "site_name": preview.site_name
                }
                frappe.cache().set_value(url, data)
            message_links.append(data)

    return message_links
