import frappe


@frappe.whitelist()
def get_messages(channel_id: str, base_message=None, before_message=None, after_message=None):

    # Check if the user has permission to view the channel
    check_permission(channel_id)

    messages = get_message_list(channel_id, base_message=base_message, before_message=before_message, after_message=after_message)

    # Track the visit of the user to the channel if the messages fetched are latest
    if not base_message:
        track_visit(channel_id, True)

    #TODO: Also send a pagination cursor to the client - base64 encoded message_id + timestamp
    

    return messages

def get_message_list(channel_id: str, base_message=None, before_message=None, after_message=None):
    '''
        Get a list of messages in the channel.
        If no base_message is provided, get the latest messages
        If base_message is provided, get the 10 messages before the base_message and 10 messages after the base_message
    '''
    # TODO: Change to 50 
    limit = 20
    if base_message:
        # TODO:
        return []
    else:
        filters = {'channel_id': channel_id}
        if before_message:
            filters['name'] = ['<', before_message]
        elif after_message:
            filters['name'] = ['>', after_message]
        messages = frappe.db.get_all('Raven Message',
                                    filters=filters,
                                    fields=['name', 'owner', 'creation', 'text',
                                            'file', 'message_type', 'message_reactions', 'is_reply', 'linked_message', '_liked_by', 'channel_id', 'thumbnail_width', 'thumbnail_height', 'file_thumbnail'],
                                    order_by='creation desc, name asc',
                                    page_length=limit,
        )

        has_old_messages = len(messages) == limit

    return {
        'messages': messages,
        'has_old_messages': has_old_messages
    }

def check_permission(channel_id):
    '''
        Check if the user has permission to view the messages in the channel
    '''
    if frappe.db.get_value('Raven Channel', channel_id, 'type') == 'Private':
        if frappe.db.exists("Raven Channel Member", {"channel_id": channel_id, "user_id": frappe.session.user}):
            pass
        elif frappe.session.user == "Administrator":
            pass
        else:
            frappe.throw(
                "You don't have permission to view this channel", frappe.PermissionError)


def track_visit(channel_id: str, commit=False):
    '''
    Track the last visit of the user to the channel.
    If the user is not a member of the channel, create a new member record
    '''
    doc = frappe.db.get_value("Raven Channel Member", {
        "channel_id": channel_id, "user_id": frappe.session.user}, "name")
    if doc:
        frappe.db.set_value("Raven Channel Member", doc,
                            "last_visit", frappe.utils.now())
    elif frappe.db.get_value('Raven Channel', channel_id, 'type') == 'Open':
        frappe.get_doc({
            "doctype": "Raven Channel Member",
            "channel_id": channel_id,
            "user_id": frappe.session.user,
            "last_visit": frappe.utils.now()
        }).insert()
    frappe.publish_realtime(
            'raven:unread_channel_count_updated', {
                'channel_id': channel_id,
                'play_sound': False
            }, user=frappe.session.user, after_commit=True)
    # Need to commit the changes to the database if the request is a GET request
    if commit:
        frappe.db.commit()