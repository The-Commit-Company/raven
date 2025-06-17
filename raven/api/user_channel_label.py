import frappe
from frappe import _

def _fail(title: str, message: str, code: int = 417):
    frappe.local.response.http_status_code = code
    frappe.local.response.type = "json"
    frappe.local.response.message = {
        "status": "error",
        "title": title,
        "message": message
    }
    raise frappe.ValidationError


@frappe.whitelist()
def add_label_to_multiple_channels(label_id, channel_ids):
    import json
    user = frappe.session.user

    if not label_id or not channel_ids:
        return _fail(
            title=_("Thiếu dữ liệu"),
            message=_("Cần cung cấp label_id và danh sách channel.")
        )

    try:
        channel_ids = json.loads(channel_ids)
    except Exception:
        return _fail(
            title=_("Dữ liệu không hợp lệ"),
            message=_("channel_ids phải là định dạng JSON list.")
        )

    if not isinstance(channel_ids, list):
        return _fail(
            title=_("Sai kiểu dữ liệu"),
            message=_("channel_ids phải là danh sách (list).")
        )

    for channel_id in channel_ids:
        exists = frappe.db.exists("User Channel Label", {
            "label": label_id,
            "channel_id": channel_id,
            "user": user
        })
        if exists:
            channel_name = frappe.db.get_value("Raven Channel", channel_id, "channel_name") or channel_id
            return _fail(
                title=_("Không thể gán nhãn"),
                message=_("Kênh đã được gán nhãn trước đó.").format(channel_name),
                code=409
            )

    for channel_id in channel_ids:
        frappe.get_doc({
            "doctype": "User Channel Label",
            "user": user,
            "channel_id": channel_id,
            "label": label_id
        }).insert(ignore_permissions=True)

    return {"status": "success"}

@frappe.whitelist()
def remove_channel_from_label(label_id: str, channel_id: str):
    user = frappe.session.user

    frappe.db.delete('User Channel Label', {
        'user': user,
        'label': label_id,
        'channel_id': channel_id
    })

    return {'message': 'Đã xoá channel khỏi nhãn'}
