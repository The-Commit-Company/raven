import frappe
from frappe.model.document import Document

class ChatTopic(Document):
    def validate(self):
        # Kiểm tra và đảm bảo các trường bắt buộc
        if not self.title:
            frappe.throw("Tiêu đề chủ đề không được để trống")
        
        if not self.description:
            frappe.throw("Mô tả chủ đề không được để trống")
        
        if not self.default_prompt:
            frappe.throw("Prompt mặc định không được để trống")
    
    def after_insert(self):
        # Gửi sự kiện realtime khi tạo chủ đề mới
        frappe.publish_realtime(
            "chatbot_topic_created",
            {
                "topic_id": self.name,
                "title": self.title,
                "description": self.description
            }
        )
    
    def on_trash(self):
        # Gửi sự kiện realtime khi xóa chủ đề
        frappe.publish_realtime(
            "chatbot_topic_deleted",
            {
                "topic_id": self.name
            }
        ) 