import frappe

@frappe.whitelist()
def get_threads():
    """
    Fetches all the threads that the current user is a participant of
    """
    thread_ids = frappe.db.get_list('Raven Thread', filters=[["Raven Thread Participant", "user", "=", frappe.session.user]])
    threads = []
    for thread in thread_ids:
        thread = frappe.get_doc("Raven Thread", thread.name)
        threads.append(thread)

    return threads