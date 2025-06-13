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
        fields=["name", "title", "created_on"],
        order_by="created_on desc"
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
def analyze_topic(message):
    """Phân tích tin nhắn để tìm chủ đề chính"""
    try:
        client = get_open_ai_client()
        if not client:
            return None
            
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Bạn là một trợ lý AI giúp phân tích chủ đề chính của một tin nhắn. Hãy trả về một cụm từ ngắn gọn (tối đa 5 từ) mô tả chủ đề chính."},
                {"role": "user", "content": message}
            ],
            temperature=0.3,
            max_tokens=50
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Lỗi khi phân tích chủ đề: {str(e)}")
        return None

@frappe.whitelist()
def send_message(conversation_id, message, is_user=True):
    try:
        print("=== BẮT ĐẦU GỬI TIN NHẮN ===")
        print(f"Conversation ID: {conversation_id}")
        print(f"Message: {message}")
        print(f"Is User: {is_user}")
        
        # Kiểm tra conversation có tồn tại không
        if not frappe.db.exists("ChatConversation", conversation_id):
            print(f"ERROR: Không tìm thấy conversation: {conversation_id}")
            frappe.throw(_("Cuộc trò chuyện không tồn tại"))
            
        conversation = frappe.get_doc("ChatConversation", conversation_id)
        print(f"Đã tìm thấy conversation: {conversation.name}")
        
        # Kiểm tra nếu là tin nhắn đầu tiên của người dùng
        if is_user:
            # Lấy số lượng tin nhắn hiện tại
            message_count = frappe.db.count("ChatMessage", {
                "parent": conversation_id,
                "parentfield": "messages",
                "parenttype": "ChatConversation"
            })
            
            if message_count == 0:
                # Phân tích chủ đề từ tin nhắn đầu tiên
                topic = analyze_topic(message)
                if topic:
                    # Đổi tên conversation
                    conversation.title = topic
                    conversation.save(ignore_permissions=True)
                    frappe.db.commit()
                    print(f"Đã đổi tên conversation thành: {topic}")
        
        # Tạo tin nhắn mới
        new_message = frappe.get_doc({
            "doctype": "ChatMessage",
            "parent": conversation_id,
            "parentfield": "messages",
            "parenttype": "ChatConversation",
            "sender": frappe.session.user if is_user else "AI Assistant",
            "is_user": is_user,
            "message": message,
            "timestamp": frappe.utils.now()
        })
        new_message.insert(ignore_permissions=True)
        frappe.db.commit()
        print(f"Đã lưu tin nhắn vào conversation thành công")
        
        # Gửi realtime update
        frappe.publish_realtime(
            "new_message",
            {
                "channel_id": conversation_id,
                "user": frappe.session.user if is_user else "AI Assistant",
                "message": message,
                "is_user": is_user,
                "timestamp": frappe.utils.now(),
                "message_type": "Text",
                "content": message
            },
            user=conversation.user
        )
        
        # Nếu là tin nhắn từ người dùng, gọi AI trả lời ở background
        if is_user:
            frappe.enqueue(
                "raven.api.chatbot.handle_ai_reply",
                queue='long',
                conversation_id=conversation_id
            )
            
        # Trả về conversation
        return {
            "conversation": conversation
        }
    except Exception as e:
        error_message = f"{str(e)}\n{frappe.get_traceback()}"
        frappe.log_error(error_message, "Lỗi tổng thể khi gửi tin nhắn")
        frappe.throw(_("Có lỗi xảy ra khi gửi tin nhắn"))

def handle_ai_reply(conversation_id):
    import traceback
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
        print("[LOG] Raven Settings:", raven_settings.as_dict())
        if not raven_settings.enable_ai_integration:
            print("[LOG] AI integration chưa bật!")
            return
            
        print("[LOG] Trước khi gọi get_open_ai_client()")
        client = get_open_ai_client()
        print(f"[LOG] Client OpenAI: {client}")
        if not client:
            print("[LOG] Không thể kết nối OpenAI!")
            return
            
        print("[LOG] Gọi OpenAI...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=chat_messages,
            temperature=0.7,
            max_tokens=1000
        )
        print(f"[LOG] Phản hồi OpenAI: {response}")
        ai_response = response.choices[0].message.content
        print(f"[LOG] Nội dung phản hồi AI: {ai_response}")
        if not ai_response:
            print("[LOG] Không nhận được phản hồi từ AI!")
            return
            
        # Tạo tin nhắn AI mới
        new_message = frappe.get_doc({
            "doctype": "ChatMessage",
            "parent": conversation_id,
            "parentfield": "messages",
            "parenttype": "ChatConversation",
            "sender": "AI Assistant",
            "is_user": False,
            "message": ai_response,
            "timestamp": frappe.utils.now()
        })
        new_message.insert(ignore_permissions=True)
        frappe.db.commit()
        
        # Gửi realtime update
        frappe.publish_realtime(
            "new_message",
            {
                "channel_id": conversation_id,
                "user": "AI Assistant",
                "message": ai_response,
                "is_user": False,
                "timestamp": frappe.utils.now(),
                "message_type": "Text",
                "content": ai_response
            },
            user=frappe.get_doc("ChatConversation", conversation_id).user
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
def get_topics():
    """Lấy danh sách các chủ đề chat"""
    topics = frappe.get_all(
        "ChatTopic",
        fields=["name", "title", "description", "default_prompt", "icon"],
        order_by="title asc"
    )
    return topics 