import frappe
from linkpreview import link_preview

@frappe.whitelist()
def get_preview_link(url):
    preview = link_preview(url)
    return {
        "title": preview.title,
        "description": preview.description,
        "image": preview.image,
        "force_title": preview.force_title,
        "absolute_image": preview.absolute_image,
        "site_name": preview.site_name
    }