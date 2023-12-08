import frappe
from linkpreview import link_preview
import json
import re

@frappe.whitelist(methods=['GET'])
def get_preview_link(urls):

    data = {}
    empty_data = {
                        "title": "",
                        "description": "",
                        "image": "",
                        "force_title": "",
                        "absolute_image": "",
                        "site_name": ""
                    }
    message_links = []

    if urls and urls != '[]':
        urls = json.loads(urls)

        for url in urls:
            data = frappe.cache().get_value(url)
            if data == None:
                # Don't try to preview insecure links like IP addresses
                # If URL is an IP address, or starts with mailto or tel, don't preview. Just return empty data
                if url.startswith('mailto') or url.startswith('tel') or re.match(r'http://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.*', url) or re.match(r'https://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.*', url) or re.match(r'http://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url) or re.match(r'https://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url):
                    data = empty_data
                else:
                    preview = None
                    try:
                        preview = link_preview(url)
                    except:
                        pass
                    if preview == None:
                        data = empty_data
                    else:
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
