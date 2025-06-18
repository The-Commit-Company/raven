import frappe
from frappe import _
from frappe.model.document import Document
from raven.ai.openai_client import get_open_ai_client
from raven.chatbot.doctype.chatconversation.chatconversation import ChatConversation
from raven.chatbot.doctype.chatmessage.chatmessage import ChatMessage
import uuid
import traceback
import os
from frappe.utils import get_files_path
from PyPDF2 import PdfReader
import docx
import pandas as pd

# Constants
CONTEXT_LIMIT = 20  # số tin nhắn gần nhất để gửi cho AI

# Helper: Tạo tin nhắn
def create_message(conversation_id, message, is_user=True, message_type="Text", file=None):
    message_id = str(uuid.uuid4())
    chat_message = frappe.get_doc({
        "doctype": "ChatMessage",
        "name": message_id,
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
    return chat_message

def extract_text_from_file(file_url):
    is_private = file_url.startswith("/private/")
    base_path = get_files_path(is_private=is_private)
    full_path = os.path.join(base_path, os.path.basename(file_url))

    try:
        if file_url.endswith(".pdf"):
            with open(full_path, 'rb') as f:
                reader = PdfReader(f)
                return '\n'.join([page.extract_text() for page in reader.pages if page.extract_text()])
        elif file_url.endswith(".docx"):
            doc = docx.Document(full_path)
            return '\n'.join([p.text for p in doc.paragraphs])
        elif file_url.endswith((".xls", ".xlsx")):
            df = pd.read_excel(full_path)
            return df.to_string(index=False)
        elif file_url.endswith(".txt"):
            with open(full_path, 'r', encoding='utf-8') as f:
                return f.read()
    except Exception as e:
        return f"[Không thể đọc file: {e}]"

    return "[Định dạng file không hỗ trợ]"

# Helper: Xây dựng context từ các tin nhắn gần nhất
def build_context(conversation_id):
    messages = frappe.get_all(
        "ChatMessage",
        filters={"parent": conversation_id},
        fields=["sender", "is_user", "message", "timestamp", "file"],
        order_by="timestamp desc",
        limit_page_length=CONTEXT_LIMIT
    )[::-1]

    context = []
    for msg in messages:
        content = msg.message or ""
        if msg.file:
            file_text = extract_text_from_file(msg.file)
            content += f"\n\n[Nội dung file đính kèm:]\n{file_text}"
        context.append({
            "role": "user" if msg.is_user else "assistant",
            "content": content
        })

    return context

# Helper: Gọi OpenAI
def call_openai(context):
    raven_settings = frappe.get_cached_doc("Raven Settings")
    if not raven_settings.enable_ai_integration:
        return "AI chưa được kích hoạt. Vui lòng liên hệ admin."

    client = get_open_ai_client()
    if not client:
        return "Không thể kết nối OpenAI. Vui lòng kiểm tra cấu hình API key."

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=context,
        temperature=0.7,
        max_tokens=1000
    )
    return response.choices[0].message.content


@frappe.whitelist()
def get_conversations():
    return frappe.get_all(
        "ChatConversation",
        filters={"user": frappe.session.user},
        fields=["name", "title", "creation"],
        order_by="creation desc"
    )


@frappe.whitelist()
def create_conversation(title):
    conversation = frappe.get_doc({
        "doctype": "ChatConversation",
        "title": title,
        "user": frappe.session.user
    })
    conversation.insert()
    return conversation


@frappe.whitelist()
def get_messages(conversation_id=None):
    if not conversation_id:
        return []

    return frappe.get_all(
        "ChatMessage",
        filters={"parent": conversation_id},
        fields=["name", "sender", "is_user", "message", "timestamp" ,"message_type" ,"file"],
        order_by="timestamp asc"
    )


@frappe.whitelist()
def send_message(conversation_id, message, is_user=True, message_type="Text", file=None):
    try:
        if not frappe.db.exists("ChatConversation", conversation_id):
            frappe.throw(_("Cuộc trò chuyện không tồn tại"))

        chat_message = create_message(conversation_id, message, is_user, message_type, file)

        if is_user:
            frappe.enqueue("raven.api.chatbot.handle_ai_reply", conversation_id=conversation_id, now=False)

        return chat_message.name

    except Exception as e:
        frappe.log_error(
            f"{str(e)}\n{traceback.format_exc()}",
            "Gửi tin nhắn thất bại"
        )
        frappe.throw(_("Có lỗi xảy ra khi gửi tin nhắn"))


def handle_ai_reply(conversation_id):
    try:
        context = build_context(conversation_id)
        ai_reply = call_openai(context)

        chat_message = create_message(conversation_id, ai_reply, is_user=False)

        frappe.publish_realtime(
            event='raven:new_ai_message',
            message={
                'conversation_id': conversation_id,
                'message': ai_reply,
                'message_id': chat_message.name
            },
            after_commit=True
        )

    except Exception as e:
        frappe.log_error(
            f"Error handling AI reply:\n{str(e)}\n{traceback.format_exc()}",
            "AI Handler Error"
        )


@frappe.whitelist()
def rename_conversation(conversation_id, title):
    try:
        if not frappe.db.exists("ChatConversation", conversation_id):
            frappe.throw(_("Cuộc trò chuyện không tồn tại"))

        conversation = frappe.get_doc("ChatConversation", conversation_id)
        old_title = conversation.title
        conversation.title = title
        conversation.save(ignore_permissions=True)
        frappe.db.commit()

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
        frappe.log_error(f"{str(e)}\n{traceback.format_exc()}", "Lỗi khi đổi tên conversation")
        frappe.throw(_("Có lỗi xảy ra khi đổi tên cuộc trò chuyện"))
