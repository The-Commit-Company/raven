import frappe
from frappe import _

@frappe.whitelist()
def create_label(label):
    user = frappe.session.user
    if not label:
        frappe.throw(_("Missing label"))

    frappe.get_doc({
        "doctype": "User Label",
        "label": label,
        "owner": user
    }).insert(ignore_permissions=True)

    return {"status": "success"}

@frappe.whitelist()
def assign_label_to_channel(label_name, channel_id):
    """Gán nhãn của user hiện tại cho 1 channel cụ thể"""
    user = frappe.session.user

    # Kiểm tra nhãn thuộc về user
    label_doc = frappe.get_doc("User Label", label_name)
    if label_doc.owner != user:
        frappe.throw(_("Bạn không có quyền gán nhãn này"))

    # Kiểm tra đã tồn tại chưa
    exists = frappe.db.exists("User Channel Label", {
        "user": user,
        "channel_id": channel_id,
        "label": label_name
    })

    if exists:
        return {"status": "already_assigned"}

    frappe.get_doc({
        "doctype": "User Channel Label",
        "user": user,
        "channel_id": channel_id,
        "label": label_name
    }).insert(ignore_permissions=True)

    return {"status": "assigned"}

@frappe.whitelist()
def get_my_labels():
    user = frappe.session.user

    labels = frappe.get_all("User Label",
        filters={"owner": user},
        fields=["name", "label"])

    return labels