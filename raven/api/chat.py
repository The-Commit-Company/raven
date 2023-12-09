import frappe
from pypika import JoinType, Order
from raven.api.raven_users import get_list
from frappe import _

@frappe.whitelist(methods=['GET'])
def get_channel_members(channel_id):
    # Check if the user has permission to view the channel
    # fetch all channel members
    # get member details from user table, such as name, full_name, user_image, first_name

    if frappe.has_permission("Raven Channel", doc=channel_id):
        member_array = []
        if frappe.db.exists("Raven Channel", channel_id):
            channel_member = frappe.qb.DocType('Raven Channel Member')
            user = frappe.qb.DocType('Raven User')
            if frappe.db.get_value("Raven Channel", channel_id, "type") == "Open":
                member_array = get_list()
            else:
                member_query = (frappe.qb.from_(channel_member)
                                .join(user, JoinType.left)
                                .on(channel_member.user_id == user.name)
                                .select(user.name, user.full_name, user.user_image, user.first_name, channel_member.is_admin)
                                .where(channel_member.channel_id == channel_id)
                                .orderby(channel_member.creation, order=Order.desc))

                member_array = member_query.run(as_dict=True)

            member_object = {}
            for member in member_array:
                member_object[member.name] = member
            return member_object

        else:
            frappe.throw(_("Channel {} does not exist".format(channel_id)), frappe.DoesNotExistError)
    
    else:
        frappe.throw(_("You do not have permission to view this channel"), frappe.PermissionError)


@frappe.whitelist(methods=['GET'])
def get_reply_message_content(message_id):
    # Check if the user has permission to view the message
    # fetch all channel members
    # get member details from user table, such as name, full_name, user_image, first_name

    if frappe.db.exists("Raven Message", message_id):

        channel_id = frappe.db.get_value("Raven Message", message_id, "channel_id")
        channel_type = frappe.db.get_value("Raven Channel", channel_id, "type")
        has_permission = False

        if channel_type == 'Public' or channel_type == 'Open':
            has_permission = True
        else:
            if frappe.db.exists("Raven Channel Member", {"user_id": frappe.session.user, "channel_id": channel_id}):
                has_permission = True
        
        if has_permission:
            return frappe.db.sql("""
                SELECT owner, creation, message_type, file, text, channel_id, name
                                FROM `tabRaven Message`
                                WHERE name = %s
    """, message_id, as_dict=True)[0]
    else:
        frappe.throw(_("Message {} does not exist".format(message_id)), frappe.DoesNotExistError)
        # return frappe.db.get_value("Raven Message", message_id, ['owner', 'creation', 'message_type', 'file', 'text', 'channel_id', 'name'], ignore_permissions=True)
