frappe.ui.form.on('ChatTopic', {
    refresh: function(frm) {
        // Thêm nút tạo cuộc trò chuyện mới từ chủ đề này
        frm.add_custom_button(__('Tạo cuộc trò chuyện mới'), function() {
            frappe.prompt({
                fieldname: 'title',
                fieldtype: 'Data',
                label: __('Tiêu đề cuộc trò chuyện'),
                title: __('Tạo cuộc trò chuyện mới'),
                default: frm.doc.title,
                reqd: 1
            }, function(values) {
                frappe.call({
                    method: 'raven.api.chatbot.create_conversation',
                    args: {
                        title: values.title
                    },
                    callback: function(r) {
                        if (r.message) {
                            frappe.show_alert({
                                message: __('Cuộc trò chuyện mới đã được tạo'),
                                indicator: 'green'
                            });
                            // Chuyển đến cuộc trò chuyện mới
                            frappe.set_route('Form', 'ChatConversation', r.message.name);
                        }
                    }
                });
            });
        });
    }
}); 