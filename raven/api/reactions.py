import frappe

@frappe.whitelist(methods=['POST'])
def react(message_id: str, reaction: str):
    '''
    API to react/unreact to a message.
    #TODO: FIXME: Check if the user can react to the message
    First checks if the user has already reacted to the message.
    If yes, then unreacts (deletes), else reacts (creates).
    '''

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
        frappe.get_doc('Raven Message Reaction', existing_reaction).delete()
    
    else:
        frappe.get_doc({
            'doctype': 'Raven Message Reaction',
            'reaction': reaction,
            'message': message_id,
            'owner': user
        }).insert(ignore_permissions=True)
    frappe.db.commit()
    return 'Ok'