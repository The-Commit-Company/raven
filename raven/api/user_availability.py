import redis
import frappe


def set_user_active(login_manager):
    # Set the user's session ID in the cache
    frappe.cache().set_value(
        f'user_session_{frappe.session.user}', frappe.session.user, expires_in_sec=900)


def set_user_inactive(login_manager):
    # Remove the user's session ID from the cache
    frappe.cache().delete_key(f'user_session_{frappe.session.user}')


@frappe.whitelist()
def get_active_users():
    # Get all the cache keys that match the pattern 'user_session_*'
    user_session_keys = frappe.cache().get_keys('user_session_*')
    # Decode the keys and split them to get the key name
    decoded_keys = [key.decode('utf-8').split('|')[1]
                    for key in user_session_keys]
    # Get the user IDs from the cache
    user_ids = [frappe.cache().get_value(key) for key in decoded_keys]

    return user_ids


@frappe.whitelist()
def refresh_user_active_state():

    # Set the key again with a new expiry time
    frappe.cache().set_value(
        f'user_session_{frappe.session.user}', frappe.session.user, expires_in_sec=900)
