import frappe

@frappe.whitelist()
def get_threads():
    thread_ids = frappe.db.get_list('Raven Thread', filters=[["Raven Thread Participant", "user", "=", frappe.session.user]])
    threads = []
    for thread in thread_ids:
        thread = frappe.get_doc("Raven Thread", thread.name)
        threads.append(thread)

    return threads


@frappe.whitelist()
def get_thread_messages(thread_id):
    """
    Fetches all the messages in a thread
    """
    thread_messages = frappe.db.get_all(
		"Raven Message",
		filters={"thread_id": thread_id},
		fields=[
			"name",
			"owner",
			"creation",
			"modified",
			"text",
			"file",
			"message_type",
			"message_reactions",
			"is_reply",
			"linked_message",
			"_liked_by",
			"channel_id",
			"thumbnail_width",
			"thumbnail_height",
			"file_thumbnail",
			"link_doctype",
			"link_document",
			"replied_message_details",
			"content",
			"is_edited",
			"is_forwarded",
		],
		order_by="creation asc",
    )

    return thread_messages


@frappe.whitelist(methods=["POST"])
def create_thread(message_id, message_content, channel_id):
    """
    Creates a new thread for the given message
    """
    # 1. Create a new thread, with the given message as the thread message, and the current user as a participant
    # 2. Return the thread_id

    thread = frappe.get_doc(
		{
			"doctype": "Raven Thread",
			"thread_message": message_id,
			"title": message_content,
			"channel_id": channel_id,
		}
    )

    thread.append("participants", {"user": frappe.session.user})

    thread.insert()

    return thread.name