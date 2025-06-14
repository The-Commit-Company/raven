import frappe
from frappe.rate_limiter import rate_limit
import time

# Đặt thời gian tối thiểu giữa mỗi lần gửi sự kiện
TYPING_DEBOUNCE_TIME = 2  # thời gian chờ giữa các lần gửi sự kiện (số giây)

last_typing_event = {}

@frappe.whitelist()
@rate_limit(limit=1, seconds=2)
def set_typing(channel):
    user = frappe.session.user
    current_time = time.time()

    # Kiểm tra nếu người dùng đã gửi sự kiện trong thời gian gần đây
    if user in last_typing_event and (current_time - last_typing_event[user]) < TYPING_DEBOUNCE_TIME:
        return {"status": "success"}  # Nếu gửi quá sớm, không phát sự kiện

    last_typing_event[user] = current_time  # Cập nhật thời gian gửi sự kiện

    frappe.publish_realtime(
        event="raven_typing",
        message={"user": user, "channel": channel},
        doctype="Raven Channel",
        docname=channel
    )

    return {"status": "success"}
