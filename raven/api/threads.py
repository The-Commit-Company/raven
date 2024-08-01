import frappe
from frappe import _

def check_permission(message_id):
    """
    Check if the user has read access to the channel in which the message has been sent.
    """
    # Get 'channel_id' from the message
    channel_id = frappe.get_cached_value("Raven Message", message_id, "channel_id")

    # Check permission for channel access
    if not frappe.has_permission(doctype="Raven Channel", doc=channel_id, ptype="read"):
        frappe.throw(_("You do not have permission to access this channel"), frappe.PermissionError)

@frappe.whitelist(methods="POST")
def create_thread(message_id):
    """
    A thread can be created by any user with read access to the channel in which the message has been sent.
    The thread will be created with this user as the first participant. 
    (If the user is not the sender of the message, the sender will be added as the second participant)
    """
    # Check permission for channel access
    check_permission(message_id)

    # Check if the message is already a thread message
    if frappe.get_cached_value("Raven Message", message_id, "is_thread"):
        frappe.throw(_("This message is already a thread"))

    # Convert the message to a thread
    frappe.db.set_value("Raven Message", message_id, "is_thread", 1).ignore_permissions = True

    # Add the thread creator as a participant
    frappe.get_doc({
        "doctype": "Raven Thread Participant",
        "parent": message_id,
        "participant": frappe.session.user
    }).insert().ignore_permissions = True

    # If the message is not sent by the user, add the sender as a participant as well
    sender = frappe.get_cached_value("Raven Message", message_id, "owner")
    if sender != frappe.session.user:
        frappe.get_doc({
            "doctype": "Raven Thread Participant",
            "parent": message_id,
            "participant": sender
        }).insert().ignore_permissions = True

    return 'Thread created'

@frappe.whitelist()
def get_thread(message_id):
    """
    Get the all the thread (messages)replies for the message
    """
    # Check permission for channel access
    check_permission(message_id)

    # Check if the message is a thread
    if not frappe.get_cached_value("Raven Message", message_id, "is_thread"):
        frappe.throw(_("This message is not a thread"))

    # Get all the thread messages
    pass





