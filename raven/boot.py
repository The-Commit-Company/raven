import frappe

def boot_session(bootinfo):

    raven_settings = frappe.get_single("Raven Settings")
    bootinfo.show_raven_chat_on_desk = raven_settings.show_raven_on_desk
    bootinfo.raven_push_notifications = {
        "enabled": raven_settings.enable_push_notifications,
        "method": raven_settings.push_notification_method,
        "vapid_public_key": raven_settings.vapid_public_key,
        "firebase_client_configuration": raven_settings.firebase_client_configuration
    }