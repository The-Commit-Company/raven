frappe.ui.form.on('ChatConversation', {
    refresh: function(frm) {
        // Thêm nút xóa cuộc trò chuyện
        frm.add_custom_button(__('Xóa cuộc trò chuyện'), function() {
            frappe.confirm(
                'Bạn có chắc chắn muốn xóa cuộc trò chuyện này?',
                function() {
                    frm.trigger('delete_conversation');
                }
            );
        });
    },
    
    delete_conversation: function(frm) {
        frappe.call({
            method: 'frappe.client.delete',
            args: {
                doctype: 'ChatConversation',
                name: frm.doc.name
            },
            callback: function(r) {
                if (r.message) {
                    frappe.show_alert({
                        message: __('Cuộc trò chuyện đã được xóa'),
                        indicator: 'green'
                    });
                    frappe.set_route('List', 'ChatConversation');
                }
            }
        });
    }
}); 