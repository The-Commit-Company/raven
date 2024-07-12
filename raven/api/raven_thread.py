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


@frappe.whitelist(methods=["POST"])
def create_thread(message_id, channel_id):
    """
    Creates a new thread for the given message
    """
    # 1. Create a new thread, with the given message as the primary thread message
    # 2. Add the message as the first message in the thread and add the current user as the first participant
    # 2. Return the thread_id

    thread = frappe.get_doc(
		{
			"doctype": "Raven Thread",
			"thread_message_id": message_id,
			"channel_id": channel_id,
		}
    )
    thread.append("messages", {"message": message_id})
    thread.append("participants", {"user": frappe.session.user})

    thread.insert()

    return thread.name