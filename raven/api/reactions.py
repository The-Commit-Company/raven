import frappe

@frappe.whitelist(methods=['POST'])
def react(message_id: str, reaction: str):
    '''
    API to react/unreact to a message.
    Checks if the user can react to the message
    First checks if the user has already reacted to the message.
    If yes, then unreacts (deletes), else reacts (creates).
    '''

    channel_id = frappe.db.get_value('Raven Message', message_id, 'channel_id')
    channel_type = frappe.db.get_value('Raven Channel', channel_id, 'type')

    if channel_type == 'Private':
        if not frappe.db.exists('Raven Channel Member', {
            'channel_id': channel_id,
            'user_id': frappe.session.user
        }):
            frappe.throw('You do not have permission to react to this message', frappe.PermissionError)
    reaction_escaped = reaction.encode('unicode-escape').decode('utf-8').replace('\\u', '')
    user = frappe.session.user
    existing_reaction = frappe.db.exists('Raven Message Reaction', {
        'message': message_id,
        'owner': user,
        'reaction_escaped': reaction_escaped
    })

    if existing_reaction:
        # Why not use frappe.db.delete? 
        # Because frappe won't run the controller method for 'after_delete' if we do so, 
        # and we need to calculate the new count of reactions for our message
        frappe.get_doc('Raven Message Reaction', existing_reaction).delete(delete_permanently=True)
    
    else:
        frappe.get_doc({
            'doctype': 'Raven Message Reaction',
            'reaction': reaction,
            'message': message_id,
            'owner': user
        }).insert(ignore_permissions=True)
    frappe.db.commit()
    return 'Ok'