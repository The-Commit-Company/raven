import frappe
from frappe.rate_limiter import rate_limit

@frappe.whitelist()
@rate_limit(limit=1, seconds=2)
def set_typing(channel):
    user = frappe.session.user
    frappe.publish_realtime(
        event="raven_typing",
        message={"user": user, "channel": channel},
        doctype="Raven Channel",
        docname=channel
    )
    return {"status": "success"}
