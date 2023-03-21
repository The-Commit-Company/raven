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
def get_logged_in_users():
    # Get all the cache keys that match the pattern 'user_session_*'
    user_session_keys = frappe.cache().get_keys('user_session_*')

    # Decode the byte strings and extract the user IDs
    user_ids = [key.decode('utf-8').split('_')[-1]
                for key in user_session_keys]

    return user_ids


@frappe.whitelist()
def refresh_logged_in_status():

    # Set the key again with a new expiry time
    frappe.cache().set_value(
        f'user_session_{frappe.session.user}', frappe.session.user, expires_in_sec=900)
