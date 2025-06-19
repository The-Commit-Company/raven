import frappe
from frappe import _
from collections import defaultdict

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

@frappe.whitelist(methods=["POST"])
def update_label(label_id, new_label):
    user = frappe.session.user

    if not label_id or not new_label:
        frappe.throw(_("Missing label id or new label"))

    label_doc = frappe.get_doc("User Label", label_id)

    if not label_doc or label_doc.doctype != "User Label":
        frappe.throw(_("Invalid label"))

    if label_doc.owner != user:
        frappe.throw(_("You are not allowed to edit this label"))

    # Kiểm tra trùng tên label khác của cùng user
    duplicate = frappe.db.exists(
        "User Label",
        {
            "owner": user,
            "label": new_label,
            "name": ["!=", label_id]
        }
    )
    if duplicate:
        frappe.throw(_("Label name already exists"))

    label_doc.label = new_label
    label_doc.save(ignore_permissions=True)

    return {
        "status": "success",
        "message": "Label updated"
    }

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

    # Xoá các liên kết từ User Channel Label theo user và label
    frappe.db.delete("User Channel Label", {
        "label": label_id,
        "user": user
    })

    # Xoá document nhãn
    label_doc.delete(ignore_permissions=True)

    # ✅ Commit để đảm bảo thay đổi được ghi nhận ngay
    frappe.db.commit()

    return {
        "status": "success",
        "message": "Label deleted"
    }

@frappe.whitelist()
def get_my_labels():
    user = frappe.session.user

    # Lấy tất cả nhãn của user
    labels = frappe.get_all(
        "User Label",
        filters={"owner": user},
        fields=["name", "label"]
    )

    label_ids = [l["name"] for l in labels]
    if not label_ids:
        return []

    # Lấy các channel liên kết với từng label
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

    # Gom nhãn theo label_id
    label_map = defaultdict(list)
    for row in rows:
        label_map[row["label"]].append({
            "channel_id": row["channel_id"],
            "channel_name": row["channel_name"],
            "is_direct_message": bool(row.get("is_direct_message"))
        })

    # Build kết quả trả về
    result = []
    for label in labels:
        result.append({
            "label_id": label["name"],
            "label": label["label"],
            "channels": label_map[label["name"]]
        })

    return result
