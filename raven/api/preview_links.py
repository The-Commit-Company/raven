import frappe
from linkpreview import link_preview
import json


@frappe.whitelist(methods=['GET'])
def get_preview_link(urls):

    data = {}
    message_links = []

    if urls and urls != '[]':
        print(urls)
        urls = json.loads(urls)

        print(urls, type(urls))
        for url in urls:
            data = frappe.cache().get_value(url)
            if data == None:
                # Don't tru to preview unsecure links
                if url.startswith('https://'):

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
                else:
                    data = {
                        "title": "",
                        "description": "",
                        "image": "",
                        "force_title": "",
                        "absolute_image": "",
                        "site_name": ""
                    }
            message_links.append(data)

    return message_links
