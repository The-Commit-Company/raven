import frappe
from frappe.model.document import Document

class ChatConversation(Document):
    def before_save(self):
        if not self.created_on:
            self.created_on = frappe.utils.now()
    
    def after_insert(self):
        # Gửi sự kiện realtime khi tạo cuộc trò chuyện mới
        frappe.publish_realtime(
            "chatbot_conversation_created",
            {
                "conversation_id": self.name,
                "title": self.title,
                "user": self.user,
                "created_on": self.created_on
            },
            user=self.user
        )
    
    def on_trash(self):
        # Xóa tất cả tin nhắn khi xóa cuộc trò chuyện
        messages = frappe.get_all(
            "ChatMessage",
            filters={"parent": self.name},
            fields=["name"]
        )
        for message in messages:
            frappe.delete_doc("ChatMessage", message.name) 