import frappe

def after_insert(doc, method):
    """
    Create a new Channel Member if a channel for the department exists
    """
    if not doc.department or not doc.user_id:
        return

    channel_id = get_channel_for_department(doc.department)

    if not channel_id:
        return
    
    raven_user_id = get_raven_user_for_user(doc.user_id)
    
    if not raven_user_id:
        return
    
    create_channel_member(channel_id=channel_id, raven_user_id=raven_user_id, employee_id=doc.name)

def on_update(doc, method):
    # TODO: Check if department has changed. 
    # If it has, we need to remove the channel member from the existing department channel
    # And add it to the new department's channel
    pass

def on_trash(doc, method):
    frappe.db.delete("Raven Channel Member", {
        "linked_doctype": "Employee",
        "linked_document": doc.name
    })

def create_channel_member(channel_id, raven_user_id, employee_id):
    channel_member = frappe.get_doc({
        "doctype": "Raven Channel Member",
        "channel_id": channel_id,
        "user_id": raven_user_id,
        "is_synced": 1,
        "linked_doctype": "Employee",
        "linked_document": employee_id
    })

    channel_member.insert(ignore_permissions=True)

def get_channel_for_department(department):
     # Check if channel exists for the department
    channel = frappe.get_all("Raven Channel", {
        "linked_doctype": "Department",
        "linked_document": department
    }, pluck='name', limit=1)

    if len(channel) == 0:
        return None
    
    return channel[0]

def get_raven_user_for_user(user_id):
     # Check if Raven User exists for the user id
    raven_user = frappe.get_all("Raven User", {
        "user": user_id
    }, pluck='name', limit=1)

    if len(raven_user) == 0:
        return None
    
    return raven_user[0]