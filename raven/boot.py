import frappe

def boot_session(bootinfo):
    bootinfo.show_raven_chat_on_desk = frappe.db.get_single_value("Raven Settings", "show_raven_on_desk")