import frappe
from frappe.model.document import Document

class ChatMessage(Document):
    def before_save(self):
        if not self.timestamp:
            self.timestamp = frappe.utils.now()
    
    def after_insert(self):
        # Gửi sự kiện realtime khi có tin nhắn mới
        conversation = frappe.get_doc("ChatConversation", self.parent)
        frappe.publish_realtime(
            "chatbot_message_created",
            {
                "message_id": self.name,
                "conversation_id": self.parent,
                "sender": self.sender,
                "is_user": self.is_user,
                "message": self.message,
                "timestamp": self.timestamp
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