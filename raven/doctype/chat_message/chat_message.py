import frappe
from frappe.model.document import Document

class ChatMessage(Document):
    def before_save(self):
        if not self.timestamp:
            self.timestamp = frappe.utils.now()
    
    def after_insert(self):
        conversation = frappe.get_doc("ChatConversation", self.parent)
        frappe.log_error(f"[DEBUG] Publish new_message: parent={self.parent}, sender={self.sender}, user={conversation.user}", "ChatMessage after_insert")
        frappe.publish_realtime(
            "new_message",
            {
                "channel_id": self.parent,
                "user": self.sender,
                "message": self.message,
                "is_user": self.is_user,
                "timestamp": self.timestamp,
                "message_type": "Text",
                "content": self.message
            },
            user=conversation.user
        )
    
    def on_trash(self):
        # Gửi sự kiện realtime khi xóa tin nhắn
        conversation = frappe.get_doc("ChatConversation", self.parent)
        frappe.publish_realtime(
            "chatbot_message_deleted",
            {
                "message_id": self.name,
                "conversation_id": self.parent
            },
            user=conversation.user
        ) 