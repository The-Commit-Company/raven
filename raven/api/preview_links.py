import frappe
from linkpreview import link_preview

@frappe.whitelist()
def get_preview_link(url):
    
    data = {}

    if (url):
        data = frappe.cache().get_value(url)
        if data==None:
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
    
    return data