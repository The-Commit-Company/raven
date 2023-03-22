__version__ = '0.0.1'
import frappe


def set_availability():
    def wrapper(fn):
        frappe.cache().set_value(
            f'user_session_{frappe.session.user}', frappe.session.user, expires_in_sec=900)
        print("decorator called")
        return fn
    return wrapper
