import frappe
def after_install():
    create_general_channel()


def create_general_channel():
    if not frappe.db.exists("Raven Channel", "general"):
        channel = frappe.new_doc("Raven Channel")
        channel.channel_name = "General"
        channel.name = "general"
        channel.type = "Open"
        channel.save(ignore_permissions=True)
        frappe.db.commit()
