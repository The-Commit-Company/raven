frappe.provide('raven.chatbot');

// Khởi tạo kết nối realtime
frappe.realtime.init(window.socketio_port || "9000");

// Lắng nghe sự kiện tin nhắn mới
frappe.realtime.on("new_message", (data) => {
    console.log("Nhận tin nhắn mới:", data);
    // Cập nhật UI khi có tin nhắn mới
    if (data.channel_id === frappe.get_route()[2]) {
        get_messages(data.channel_id).then(function(r) {
            if (r.message) {
                append_message(r.message[r.message.length - 1]);
            }
        });
    }
});

// Lắng nghe sự kiện xóa tin nhắn
frappe.realtime.on("chatbot_message_deleted", (data) => {
    // Cập nhật UI khi tin nhắn bị xóa
    if (data.conversation_id === frappe.get_route()[2]) {
        remove_message(data.message_id);
    }
});

// Lắng nghe sự kiện tạo cuộc trò chuyện mới
frappe.realtime.on("chatbot_conversation_created", (data) => {
    console.log("Tạo cuộc trò chuyện mới:", data);
    // Cập nhật danh sách cuộc trò chuyện
    if (data.user === frappe.session.user) {
        update_conversation_list(data);
    }
});

// Lắng nghe sự kiện xóa cuộc trò chuyện
frappe.realtime.on("chatbot_conversation_deleted", (data) => {
    // Cập nhật danh sách cuộc trò chuyện
    if (data.user === frappe.session.user) {
        remove_conversation(data.conversation_id);
    }
});

// Hàm gửi tin nhắn
raven.chatbot.send_message = function(conversation_id, message) {
    console.log("Gửi tin nhắn:", {conversation_id, message});
    
    // Kiểm tra input
    if (!conversation_id) {
        console.error("Không có conversation_id");
        frappe.show_alert({
            message: "Vui lòng chọn hoặc tạo cuộc trò chuyện mới",
            indicator: "red"
        });
        return Promise.reject("Không có conversation_id");
    }
    
    if (!message || message.trim() === "") {
        console.error("Tin nhắn trống");
        frappe.show_alert({
            message: "Vui lòng nhập tin nhắn",
            indicator: "red"
        });
        return Promise.reject("Tin nhắn trống");
    }
    
    return frappe.call({
        method: 'raven.api.raven_message.send_message',
        args: {
            channel_id: conversation_id,
            text: message,
            json_content: {
                "content": [
                    {
                        "content": [
                            {
                                "text": message,
                                "type": "text"
                            }
                        ],
                        "type": "paragraph"
                    }
                ],
                "type": "doc"
            },
            is_reply: false
        },
        callback: function(response) {
            console.log("Kết quả gửi tin nhắn:", response);
            if (response.message) {
                append_message(response.message);
            }
        },
        error: function(err) {
            console.error("Lỗi khi gửi tin nhắn:", err);
            frappe.show_alert({
                message: "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.",
                indicator: "red"
            });
        }
    });
};

// Hàm tạo cuộc trò chuyện mới
raven.chatbot.create_conversation = function(title) {
    console.log("Tạo cuộc trò chuyện mới:", title);
    
    // Kiểm tra input
    if (!title || title.trim() === "") {
        console.error("Tiêu đề trống");
        frappe.show_alert({
            message: "Vui lòng nhập tiêu đề cuộc trò chuyện",
            indicator: "red"
        });
        return Promise.reject("Tiêu đề trống");
    }
    
    return frappe.call({
        method: 'raven.api.chatbot.create_conversation',
        args: {
            title: title
        },
        callback: function(response) {
            console.log("Kết quả tạo cuộc trò chuyện:", response);
            if (response.message) {
                // Chuyển hướng đến cuộc trò chuyện mới
                frappe.set_route('chat', response.message.name);
            }
        },
        error: function(err) {
            console.error("Lỗi khi tạo cuộc trò chuyện:", err);
            frappe.show_alert({
                message: "Có lỗi xảy ra khi tạo cuộc trò chuyện. Vui lòng thử lại.",
                indicator: "red"
            });
        }
    });
};

// Hàm lấy danh sách tin nhắn
raven.chatbot.get_messages = function(conversation_id) {
    console.log("Lấy danh sách tin nhắn:", conversation_id);
    return frappe.call({
        method: 'raven.api.raven_message.get_messages',
        args: {
            channel_id: conversation_id
        }
    });
};

// Hàm lấy danh sách cuộc trò chuyện
raven.chatbot.get_conversations = function() {
    console.log("Lấy danh sách cuộc trò chuyện");
    return frappe.call({
        method: 'raven.api.chatbot.get_conversations'
    });
};

// Hàm lấy danh sách chủ đề
raven.chatbot.get_topics = function() {
    console.log("Lấy danh sách chủ đề");
    return frappe.call({
        method: 'raven.api.chatbot.get_topics'
    });
};

// Hàm thêm tin nhắn mới vào UI
function append_message(data) {
    console.log("Thêm tin nhắn vào UI:", data);
    const message_html = `
        <div class="message ${data.owner === frappe.session.user ? 'user-message' : 'ai-message'}" data-message-id="${data.name}">
            <div class="message-content">
                <div class="message-sender">${data.owner}</div>
                <div class="message-text">${data.text}</div>
                <div class="message-time">${frappe.datetime.str_to_user(data.creation)}</div>
            </div>
        </div>
    `;
    
    $('.chat-messages').append(message_html);
    scroll_to_bottom();
}

// Hàm xóa tin nhắn khỏi UI
function remove_message(message_id) {
    $(`.message[data-message-id="${message_id}"]`).remove();
}

// Hàm cập nhật danh sách cuộc trò chuyện
function update_conversation_list(data) {
    console.log("Cập nhật danh sách cuộc trò chuyện:", data);
    const conversation_html = `
        <div class="conversation-item" data-conversation-id="${data.conversation_id}">
            <div class="conversation-title">${data.title}</div>
            <div class="conversation-time">${frappe.datetime.str_to_user(data.created_on)}</div>
        </div>
    `;
    
    $('.conversation-list').prepend(conversation_html);
}

// Hàm xóa cuộc trò chuyện khỏi UI
function remove_conversation(conversation_id) {
    $(`.conversation-item[data-conversation-id="${conversation_id}"]`).remove();
}

// Hàm cuộn xuống tin nhắn mới nhất
function scroll_to_bottom() {
    const chat_messages = $('.chat-messages');
    chat_messages.scrollTop(chat_messages[0].scrollHeight);
}

// Khởi tạo các sự kiện khi trang được tải
$(document).ready(function() {
    console.log("=== CHAT PAGE INITIALIZED ===");
    
    // Xử lý sự kiện click vào cuộc trò chuyện
    $(document).on('click', '.conversation-item', function() {
        const conversation_id = $(this).data('conversation-id');
        console.log("Chọn cuộc trò chuyện:", conversation_id);
        frappe.set_route('chat', conversation_id);
    });
    
    // Xử lý sự kiện nhấn Enter trong textarea
    $('.message-input textarea').on('keypress', function(e) {
        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            const conversation_id = frappe.get_route()[2];
            const message = $(this).val().trim();
            
            if (message && conversation_id) {
                raven.chatbot.send_message(conversation_id, message)
                    .then(() => {
                        $(this).val('');
                    })
                    .catch(err => {
                        console.error("Lỗi khi gửi tin nhắn:", err);
                    });
            }
        }
    });
    
    // Xử lý sự kiện click nút gửi
    $('.message-input button').on('click', function() {
        const conversation_id = frappe.get_route()[2];
        const message = $('.message-input textarea').val().trim();
        
        if (message && conversation_id) {
            raven.chatbot.send_message(conversation_id, message)
                .then(() => {
                    $('.message-input textarea').val('');
                })
                .catch(err => {
                    console.error("Lỗi khi gửi tin nhắn:", err);
                });
        }
    });
}); 