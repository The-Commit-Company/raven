import frappe

@frappe.whitelist(methods=['POST'])
def add_push_token(token: str, platform: str, device: str = None, operating_system: str = None):
    '''
        API to add the push token for the user
    '''
    # Check if the token already exists
    if frappe.db.exists("Raven Notification Token", {"token": token, "user": frappe.session.user }):
        return
    else:
        try:
            raven_user = frappe.db.get_value("Raven User", { "user": frappe.session.user }, "name")
            # Create a new token
            notification_token = frappe.get_doc({
                "doctype": "Raven Notification Token",
                "token": token,
                "platform": platform,
                "device": device,
                "operating_system": operating_system,
                "user": frappe.session.user,
                "raven_user": raven_user
            })
            notification_token.insert()
        except Exception as e:
            frappe.log_error(frappe.get_traceback(), f"Error adding push token: {e}")