import redis
import frappe


def set_user_logged_in(login_manager):
    # Set the user's session ID in the cache
    frappe.cache().set_value(
        f'user_session_{frappe.session.user}', frappe.session.user, expires_in_sec=900)


def set_user_logged_out(login_manager):
    # Remove the user's session ID from the cache
    frappe.cache().delete_key(f'user_session_{frappe.session.user}')


@frappe.whitelist()
def is_user_logged_in(user_id):
    # Check if the user's session ID exists in the cache
    return frappe.cache().get_value(f'user_session_{user_id}') is not None


@frappe.whitelist()
def refresh_logged_in_status():

    # Set the key again with a new expiry time
    frappe.cache().set_value(
        f'user_session_{frappe.session.user}', frappe.session.user, expires_in_sec=900)
