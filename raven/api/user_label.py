import frappe
from frappe import _

@frappe.whitelist()
def create_label(label):
    user = frappe.session.user

    if not label:
        frappe.throw(_("Missing label"))

    # Kiểm tra xem user đã có nhãn này chưa
    existing = frappe.db.exists("User Label", {
        "label": label,
        "owner": user
    })

    if existing:
        frappe.throw(_("Label name already exists"))

    new_label = frappe.get_doc({
        "doctype": "User Label",
        "label": label,
        "owner": user
    })
    new_label.insert(ignore_permissions=True)

    return {
        "status": "success",
        "label_id": new_label.name
    }


@frappe.whitelist()
def update_label(label_id, new_label):
    user = frappe.session.user
    if not label_id or not new_label:
        frappe.throw(_("Missing label id or new label"))

    label_doc = frappe.get_doc("User Label", label_id)

    if not label_doc or label_doc.doctype != "User Label":
        frappe.throw(_("Invalid label"))

    if label_doc.owner != user:
        frappe.throw(_("You are not allowed to edit this label"))

    label_doc.label = new_label
    label_doc.save(ignore_permissions=True)

    return {"status": "success", "message": "Label updated"}

@frappe.whitelist()
def delete_label(label_id):
    user = frappe.session.user
    if not label_id:
        frappe.throw(_("Missing label id"))

    label_doc = frappe.get_doc("User Label", label_id)

    if not label_doc or label_doc.doctype != "User Label":
        frappe.throw(_("Invalid label"))

    if label_doc.owner != user:
        frappe.throw(_("You are not allowed to delete this label"))

    # Xoá liên kết nếu có
    frappe.db.delete("User Label Channel", {"user_label": label_id})

    label_doc.delete(ignore_permissions=True)

    return {"status": "success", "message": "Label deleted"}


from collections import defaultdict
import frappe

@frappe.whitelist()
def get_my_labels():
    user = frappe.session.user
    # 2. Truy vấn như bình thường nếu không có cache
    labels = frappe.get_all(
        "User Label",
        filters={"owner": user},
        fields=["name", "label"]
    )

    label_ids = [l["name"] for l in labels]
    if not label_ids:
        return []

    rows = frappe.db.sql("""
        SELECT
            ucl.label,
            ucl.channel_id,
            rc.channel_name,
            rc.is_direct_message
        FROM `tabUser Channel Label` ucl
        LEFT JOIN `tabRaven Channel` rc ON ucl.channel_id = rc.name
        WHERE ucl.label IN %s AND ucl.user = %s
    """, (tuple(label_ids), user), as_dict=True)

    label_map = defaultdict(list)
    for row in rows:
        label_map[row["label"]].append({
            "channel_id": row["channel_id"],
            "channel_name": row["channel_name"],
            "is_direct_message": bool(row.get("is_direct_message"))
        })

    result = []
    for label in labels:
        result.append({
            "label_id": label["name"],
            "label": label["label"],
            "channels": label_map[label["name"]]
        })
    return result
