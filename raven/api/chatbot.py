import frappe
from frappe import _
from frappe.model.document import Document
from raven.ai.openai_client import get_open_ai_client
import traceback
from raven.chatbot.doctype.chatconversation.chatconversation import ChatConversation
from raven.chatbot.doctype.chatmessage.chatmessage import ChatMessage

@frappe.whitelist()
def get_conversations():
    """Lấy danh sách các cuộc trò chuyện của người dùng hiện tại"""
    conversations = frappe.get_all(
        "ChatConversation",
        filters={"user": frappe.session.user},
        fields=["name", "title", "creation"],
        order_by="creation desc"
    )
    return conversations

@frappe.whitelist()
def create_conversation(title):
    """Tạo cuộc trò chuyện mới"""
    conversation = frappe.get_doc({
        "doctype": "ChatConversation",
        "title": title,
        "user": frappe.session.user
    })
    conversation.insert()
    return conversation

@frappe.whitelist()
def get_messages(conversation_id=None):
    """Lấy danh sách tin nhắn trong một cuộc trò chuyện"""
    if not conversation_id:
        return []

    messages = frappe.get_all(
        "ChatMessage",
        filters={"parent": conversation_id},
        fields=["name", "sender", "is_user", "message", "timestamp"],
        order_by="timestamp asc"
    )
    return messages

@frappe.whitelist()
def send_message(conversation_id, message, is_user=True, message_type="Text", file=None, context=None):
    try:
        print("=== BẮT ĐẦU GỬI TIN NHẮN ===")
        print(f"Conversation ID: {conversation_id}")
        print(f"Message: {message}")
        print(f"Is User: {is_user}")
        print(f"Message Type: {message_type}")
        print(f"File: {file}")

        # Kiểm tra conversation có tồn tại không
        if not frappe.db.exists("ChatConversation", conversation_id):
            print(f"ERROR: Không tìm thấy conversation: {conversation_id}")
            frappe.throw(_("Cuộc trò chuyện không tồn tại"))

        conversation = frappe.get_doc("ChatConversation", conversation_id)
        print(f"Đã tìm thấy conversation: {conversation.name}")

        # Tạo tin nhắn mới
        chat_message = frappe.get_doc({
            "doctype": "ChatMessage",
            "parent": conversation_id,
            "parentfield": "messages",
            "parenttype": "ChatConversation",
            "sender": frappe.session.user if is_user else "AI Assistant",
            "is_user": is_user,
            "message": message,
            "message_type": message_type,
            "file": file,
            "timestamp": frappe.utils.now()
        })
        chat_message.insert()

        # Nếu là tin nhắn của người dùng, gửi cho AI xử lý
        if is_user:
            # Gửi tin nhắn cho AI xử lý trong background
            frappe.enqueue(
                "raven.api.chatbot.handle_ai_reply",
                conversation_id=conversation_id,
                now=False
            )

        return chat_message.name

    except Exception as e:
        error_message = (
            f"User: {frappe.session.user}\n"
            f"Conversation ID: {conversation_id}\n"
            f"Error: {str(e)}\n"
            f"Traceback: {traceback.format_exc()}"
        )
        frappe.log_error(error_message, "AI Handler Error")
        print("[LOG] Ghi lỗi vào Error Log:", error_message)
        frappe.throw(_("Có lỗi xảy ra khi gửi tin nhắn"))

def handle_ai_reply(conversation_id):
    try:
        # Lấy tất cả tin nhắn của conversation
        messages = frappe.get_all(
            "ChatMessage",
            filters={
                "parent": conversation_id,
                "parentfield": "messages",
                "parenttype": "ChatConversation"
            },
            fields=["sender", "is_user", "message", "timestamp"],
            order_by="timestamp asc"
        )

        chat_messages = []
        for msg in messages:
            chat_messages.append({
                "role": "user" if msg.is_user else "assistant",
                "content": msg.message
            })
        print("[LOG] Context gửi tới OpenAI:", chat_messages)

        # Kiểm tra cấu hình AI
        raven_settings = frappe.get_cached_doc("Raven Settings")
        if not raven_settings.enable_ai_integration:
            return "AI integration chưa được bật. Vui lòng liên hệ admin để bật tính năng này."

        client = get_open_ai_client()
        if not client:
            return "Không thể kết nối với OpenAI. Vui lòng kiểm tra cấu hình API key."

        # Gọi OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=chat_messages,
            temperature=0.7,
            max_tokens=1000
        )

        ai_response = response.choices[0].message.content

        # Gửi phản hồi từ AI
        send_message(
            conversation_id=conversation_id,
            message=ai_response,
            is_user=False
        )

    except Exception as e:
        error_message = (
            f"User: {frappe.session.user}\n"
            f"Conversation ID: {conversation_id}\n"
            f"Error: {str(e)}\n"
            f"Traceback: {traceback.format_exc()}"
        )
        frappe.log_error(error_message, "AI Handler Error (Background)")
        print("[LOG] Ghi lỗi vào Error Log (Background):", error_message)

@frappe.whitelist()
def rename_conversation(conversation_id, title):
    """Đổi tên cuộc trò chuyện"""
    try:
        # Kiểm tra conversation có tồn tại không
        if not frappe.db.exists("ChatConversation", conversation_id):
            frappe.throw(_("Cuộc trò chuyện không tồn tại"))

        conversation = frappe.get_doc("ChatConversation", conversation_id)
        old_title = conversation.title

        # Cập nhật tên
        conversation.title = title
        conversation.save(ignore_permissions=True)
        frappe.db.commit()

        # Gửi realtime update cho tất cả user đang online
        frappe.publish_realtime(
            event='raven:update_conversation_title',
            message={
                'conversation_id': conversation_id,
                'old_title': old_title,
                'new_title': title,
                'creation': conversation.creation
            },
            after_commit=True,
            doctype="ChatConversation"
        )

        return conversation
    except Exception as e:
        error_message = f"{str(e)}\n{frappe.get_traceback()}"
        frappe.log_error(error_message, "Lỗi khi đổi tên conversation")
        frappe.throw(_("Có lỗi xảy ra khi đổi tên cuộc trò chuyện"))