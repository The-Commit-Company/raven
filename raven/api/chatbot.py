import frappe
from frappe import _
from frappe.model.document import Document
from raven.ai.openai_client import get_open_ai_client
import traceback

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
    """Gửi tin nhắn mới"""
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
        if is_user and len(conversation.messages) == 0:
            # Phân tích chủ đề từ tin nhắn đầu tiên
            topic = analyze_topic(message)
            if topic:
                # Đổi tên conversation
                conversation.title = topic
                conversation.save(ignore_permissions=True)
                frappe.db.commit()
                print(f"Đã đổi tên conversation thành: {topic}")
        
        # Thêm tin nhắn mới vào child table
        conversation.append("messages", {
            "sender": frappe.session.user if is_user else "AI Assistant",
            "is_user": is_user,
            "message": message,
            "timestamp": frappe.utils.now()
        })
        conversation.save(ignore_permissions=True)
        frappe.db.commit()
        print(f"Đã lưu tin nhắn vào conversation thành công")
        
        # Gửi realtime update
        frappe.publish_realtime(
            "chatbot_message_created",
            {
                "conversation_id": conversation_id,
                "sender": frappe.session.user if is_user else "AI Assistant",
                "message": message,
                "is_user": is_user,
                "timestamp": frappe.utils.now(),
                "message_type": "Text",
                "content": message
            },
            user=frappe.session.user
        )
        
        # Nếu là tin nhắn từ người dùng, gửi phản hồi từ AI
        ai_error_message = None
        ai_bot_message = None
        if is_user:
            try:
                print("[LOG] Bắt đầu xử lý AI cho conversation_id:", conversation_id)
                # Lấy danh sách tin nhắn trước đó để làm context
                messages = conversation.messages
                chat_messages = []
                # Chuyển đổi tin nhắn thành định dạng của ChatGPT
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
                    frappe.throw(_("AI Integration is not enabled"))
                print("[LOG] Trước khi gọi get_open_ai_client()")
                client = get_open_ai_client()
                print(f"[LOG] Client OpenAI: {client}")
                if not client:
                    print("[LOG] Không thể kết nối OpenAI!")
                    frappe.throw(_("Không thể kết nối với OpenAI"))
                print("[LOG] Gọi OpenAI...")
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=chat_messages,
                    temperature=0.7,
                    max_tokens=1000
                )
                print(f"[LOG] Phản hồi OpenAI: {response}")
                # Lấy phản hồi từ AI
                ai_response = response.choices[0].message.content
                print(f"[LOG] Nội dung phản hồi AI: {ai_response}")
                if not ai_response:
                    print("[LOG] Không nhận được phản hồi từ AI!")
                    frappe.throw(_("Không nhận được phản hồi từ AI"))
                # Gửi phản hồi từ AI
                send_message(conversation_id, ai_response, is_user=False)
            except Exception as e:
                error_message = f"{str(e)}\n{traceback.format_exc()}"
                frappe.log_error(error_message, "AI Handler Error")
                print("[LOG] Ghi lỗi vào Error Log:", error_message)
                # Nếu lỗi quota OpenAI thì luôn lưu message bot trả lời vào child table
                if 'insufficient_quota' in str(e) or '429' in str(e):
                    print("[LOG] Ghi message lỗi quota vào child table!")
                    conversation.append("messages", {
                        "sender": "AI Assistant",
                        "is_user": False,
                        "message": "Xin lỗi, OpenAI cần trả phí để trả lời",
                        "timestamp": frappe.utils.now()
                    })
                else:
                    print(f"[LOG] Sẽ trả về message lỗi mặc định cho user. Lỗi: {str(e)}")
                    conversation.append("messages", {
                        "sender": "AI Assistant",
                        "is_user": False,
                        "message": "Xin lỗi, tôi không thể xử lý tin nhắn của bạn lúc này. Vui lòng thử lại sau.",
                        "timestamp": frappe.utils.now()
                    })
                conversation.save(ignore_permissions=True)
                frappe.db.commit()
        # Trả về conversation (luôn có message bot trả lời nếu lỗi)
        return {
            "conversation": conversation
        }
        
    except Exception as e:
        error_message = f"{str(e)}\n{frappe.get_traceback()}"
        frappe.log_error(error_message, "Lỗi tổng thể khi gửi tin nhắn")
        frappe.throw(_("Có lỗi xảy ra khi gửi tin nhắn"))

@frappe.whitelist()
def get_topics():
    """Lấy danh sách các chủ đề chat"""
    topics = frappe.get_all(
        "ChatTopic",
        fields=["name", "title", "description", "default_prompt", "icon"],
        order_by="title asc"
    )
    return topics 