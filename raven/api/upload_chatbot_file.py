import frappe
from frappe import _
from frappe.handler import upload_file


@frappe.whitelist()
def upload_file_with_message():
    """
    Gửi file đính kèm cho Chatbot AI. Gắn file vào ChatMessage trong ChatConversation.
    """
    # Lấy dữ liệu từ form gửi lên
    conversation_id = frappe.form_dict.get("conversation_id")
    message = frappe.form_dict.get("message") or ""
    file = frappe.request.files.get("file")

    # Kiểm tra bắt buộc
    if not conversation_id:
        frappe.throw(_("Thiếu conversation_id"))
    if not file:
        frappe.throw(_("Không có file đính kèm"))

    # Tạo bản ghi ChatMessage
    message_doc = frappe.get_doc({
        "doctype": "ChatMessage",
        "parenttype": "ChatConversation",
        "parent": conversation_id,
        "parentfield": "messages",
        "sender": frappe.session.user,
        "is_user": 1,
        "message": message or file.filename,
        "message_type": "File",
    }).insert()

    # Chuẩn bị biến môi trường để upload
    frappe.form_dict.doctype = "ChatMessage"
    frappe.form_dict.docname = message_doc.name
    frappe.form_dict.fieldname = "file"
    frappe.form_dict.optimize = 0  # Tùy chọn: nếu muốn nén ảnh

    # Gọi hàm có sẵn trong Frappe để upload
    file_doc = upload_file()

    # Gắn file_url vào ChatMessage
    message_doc.file = file_doc.file_url
    message_doc.save()

    # Gọi AI trả lời (enqueue)
    frappe.enqueue("raven.api.chatbot.handle_ai_reply", conversation_id=conversation_id, now=False)

    return {
        "message": message_doc.name,
        "file_url": file_doc.file_url
    }
