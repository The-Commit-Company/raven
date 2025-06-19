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

    try:
        # Tạo bản ghi ChatMessage (tạm thời chưa có file_url)
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
        frappe.form_dict.optimize = 0  # nếu muốn nén ảnh

        # Gọi hàm upload file
        file_doc = upload_file()

        # Cập nhật file_url vào bản ghi ChatMessage
        message_doc.file = file_doc.file_url
        message_doc.save()

        # Đảm bảo tất cả đã commit trước khi AI xử lý
        frappe.db.commit()

        # Log để debug nếu cần
        frappe.logger().info(f"[UPLOAD_WITH_MESSAGE] ChatMessage đã tạo: {message_doc.name}, File: {file_doc.file_url}")

        # Gọi AI trả lời
        frappe.enqueue("raven.api.chatbot.handle_ai_reply", conversation_id=conversation_id, now=False)

        return {
            "message": message_doc.name,
            "file_url": file_doc.file_url
        }

    except Exception as e:
        frappe.log_error(f"{str(e)}", "upload_file_with_message FAILED")
        frappe.throw(_("Có lỗi xảy ra khi gửi file đính kèm"))
