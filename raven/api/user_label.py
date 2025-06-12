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
def assign_label_to_user(label_name, target_user):
    user = frappe.session.user

    doc = frappe.get_doc("User Label", label_name)
    if doc.owner != user:
        frappe.throw(_("Bạn không có quyền gán nhãn này"))

    doc.target_user = target_user
    doc.save(ignore_permissions=True)

    return {"status": "assigned"}

@frappe.whitelist()
def get_my_labels():
    user = frappe.session.user

    labels = frappe.get_all("User Label",
        filters={"owner": user},
        fields=["name", "label"])

    return labels