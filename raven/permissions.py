import frappe


def channel_has_permission(doc, user=None, permission_type=None):

    if doc.type == "Open" or doc.type == "Public":
        return True
    elif doc.type == "Private":
        if frappe.db.exists("Raven Channel Member", {"channel_id": doc.name, "user_id": user}):
            return True
        elif doc.owner == user and frappe.db.count("Raven Channel Member", {"channel_id": doc.name}) <= 0:
            return True
        elif user == "Administrator":
            return True
        else:
            return False


def channel_member_has_permission(doc, user=None, permission_type=None):

    # Allow self to modify their own channel member document
    if doc.user_id == user:
        return True

    channel_type = frappe.db.get_value("Raven Channel", doc.channel_id, "type")

    if channel_type == "Open" or channel_type == "Public":
        return True

    if channel_type == "Private":
        # If it's a private channel, only the members can modify the channel member
        if frappe.db.exists("Raven Channel Member", {"channel_id": doc.channel_id, "user_id": user}):
            return True
        elif user == "Administrator":
            return True
        else:
            return False


def message_has_permission(doc, user=None, permission_type=None):

    channel_type = frappe.db.get_value("Raven Channel", doc.channel_id, "type")
    # If the channel is open, a user can post a message. Ownership check is provided in the ORM
    if channel_type == "Open":
        return True
    
    # Allow self to modify their own message document
    if doc.owner == user and permission_type in ["write", "delete"]:
        return True


    if frappe.db.exists("Raven Channel Member", {"channel_id": doc.channel_id, "user_id": user}):
        return True
    elif user == "Administrator":
        return True
    else:
        return False



def raven_channel_query(user):
    if not user:
        user = frappe.session.user
    
    '''
      Only show channels that the user is a owner of

      We could also remove "Raven User" from the Raven Channel doctype role, but then permission checks for joining socket rooms for the channel would fail

      Hence, we are adding a WHERE clause to the query - this is inconsequential since we will never use the standard get_list query for Raven Channel,
      but needed for security since we do not want users to be able to view channels they are not a member of
    '''
    return "`tabRaven Channel`.owner = {user}".format(user=frappe.db.escape(user))

def raven_message_query(user):
    if not user:
        user = frappe.session.user
    
    '''
      Only show messages created by the user using a WHERE clause

      We could also remove "Raven User" from the Raven Message doctype role, but then permission checks for attached files would also fail.

      Hence, we are adding a WHERE clause to the query - this is inconsequential since we will never use the standard get_list query for Raven Message,
      but needed for security since we do not want users to be able to view messages from channels they are not a member of
    '''
    return "`tabRaven Message`.owner = {user}".format(user=frappe.db.escape(user))