import frappe
from frappe.query_builder.functions import Count, Coalesce
from frappe.query_builder import Case, Order, JoinType
from raven.api.raven_message import track_visit

@frappe.whitelist()
def get_messages(channel_id: str, limit: int = 20):
    '''
        API to get list of messages for a channel, ordered by creation date (newest first)
    
    '''
    # Check permission for channel access
    if not frappe.has_permission(doctype='Raven Channel', doc=channel_id, ptype='read'):
        frappe.throw('You do not have permission to access this channel', frappe.PermissionError)


    # Fetch messages for the channel

    # Cannot use `get_all` as it does not apply the `order_by` clause to multiple fields
    message = frappe.qb.DocType('Raven Message')

    messages = frappe.qb.from_(message).select(
        message.name, message.owner, message.creation, message.modified, message.text,
        message.file, message.message_type, message.message_reactions, message.is_reply, message.linked_message, message._liked_by, message.channel_id,
        message.thumbnail_width, message.thumbnail_height, message.file_thumbnail, message.link_doctype, message.link_document,
        message.replied_message_details, message.content, message.is_edited
    ).where(
        message.channel_id == channel_id
    ).orderby(message.creation, order=Order.desc).orderby(message.name, order=Order.asc).limit(limit).run(as_dict=True)
    
    has_old_messages = False

    # Check if older messages are available
    if len(messages) == limit:
        # Check if there are more messages available
        older_message = frappe.db.get_all('Raven Message',
                                          pluck='name',
                                            filters={'channel_id': channel_id, 'creation': ('<', messages[-1].creation)},
                                            order_by='creation desc, name asc',
                                            limit=1
                                            )
        
        if len(older_message) > 0:
            has_old_messages = True

    track_visit(channel_id=channel_id, commit=True)
    return {
        'messages': messages,
        'has_old_messages': has_old_messages,
        'has_new_messages': False
    }

@frappe.whitelist()
def get_older_messages(channel_id: str, from_message: str, limit: int = 20):
    '''
        API to get older messages for a channel, ordered by creation date (newest first)
    '''

    # Check permission for channel access
    if not frappe.has_permission(doctype='Raven Channel', doc=channel_id, ptype='read'):
        frappe.throw('You do not have permission to access this channel', frappe.PermissionError)

    # Fetch older messages for the channel
    from_timestamp = frappe.get_cached_value('Raven Message', from_message, 'creation')

    # Cannot use `get_all` as it does not apply the `order_by` clause to multiple fields
    message = frappe.qb.DocType('Raven Message')

    messages = frappe.qb.from_(message).select(
        message.name, message.owner, message.creation, message.modified, message.text,
        message.file, message.message_type, message.message_reactions, message.is_reply, message.linked_message, message._liked_by, message.channel_id,
        message.thumbnail_width, message.thumbnail_height, message.file_thumbnail, message.link_doctype, message.link_document,
        message.replied_message_details, message.content, message.is_edited
    ).where(
        message.channel_id == channel_id
    ).where(message.creation < from_timestamp or (message.creation == from_timestamp and message.name > from_message)).orderby(message.creation, order=Order.desc).orderby(message.name, order=Order.asc).limit(limit).run(as_dict=True)

    has_old_messages = False

    # Check if older messages are available
    if len(messages) == limit:
        # Check if there are more messages available
        older_message = frappe.db.get_all('Raven Message',
                                          pluck='name',
                                            filters={'channel_id': channel_id, 'creation': ('<', messages[-1].creation)},
                                            order_by='creation desc, name asc',
                                            limit=1
                                            )
        
        if len(older_message) > 0:
            has_old_messages = True
    
    return {
        'messages': messages,
        'has_old_messages': has_old_messages
    }

@frappe.whitelist()
def get_newer_messages(channel_id: str, from_message: str, limit: int = 20):
    '''
        API to get older messages for a channel, ordered by creation date (newest first)
    '''

    # Check permission for channel access
    if not frappe.has_permission(doctype='Raven Channel', doc=channel_id, ptype='read'):
        frappe.throw('You do not have permission to access this channel', frappe.PermissionError)

    # Fetch older messages for the channel
    from_timestamp = frappe.get_cached_value('Raven Message', from_message, 'creation')

    # Cannot use `get_all` as it does not apply the `order_by` clause to multiple fields
    message = frappe.qb.DocType('Raven Message')

    messages = frappe.qb.from_(message).select(
        message.name, message.owner, message.creation, message.modified, message.text,
        message.file, message.message_type, message.message_reactions, message.is_reply, message.linked_message, message._liked_by, message.channel_id,
        message.thumbnail_width, message.thumbnail_height, message.file_thumbnail, message.link_doctype, message.link_document,
        message.replied_message_details, message.content, message.is_edited
    ).where(
        message.channel_id == channel_id
    ).where(message.creation > from_timestamp or (message.creation == from_timestamp and message.name < from_message)).orderby(message.creation, order=Order.desc).orderby(message.name, order=Order.asc).limit(limit).run(as_dict=True)

    has_new_messages = False

    # Check if older messages are available
    if len(messages) == limit:
        # Check if there are more messages available
        newer_message = frappe.db.get_all('Raven Message',
                                          pluck='name',
                                            filters={'channel_id': channel_id, 'creation': ('>', messages[-1].creation)},
                                            order_by='creation desc, name asc',
                                            limit=1
                                            )
        
        if len(newer_message) > 0:
            has_new_messages = True
    
    return {
        'messages': messages,
        'has_new_messages': has_new_messages
    }