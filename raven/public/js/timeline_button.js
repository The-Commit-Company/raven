// Timeline button for Frappe
$(document).on('app_ready', function () {
  $.each(frappe.boot.user.can_read, function (i, doctype) {
    frappe.ui.form.on(doctype, {
      onload: function (frm) {
        if (frm.footer?.frm?.timeline) {
          let send_message_modal = (channels) => {
            if (channels && channels.message && channels.message.length > 0) {
              let channels_list = channels.message.map(
                (channel) => channel.channel_name
              );
              let dialog = new frappe.ui.Dialog({
                title: __('Send raven'),
                fields: [
                  {
                    fieldname: 'channel',
                    label: 'Channel',
                    fieldtype: 'Select',
                    options: channels_list,
                    reqd: 1,
                  },
                  {
                    fieldname: 'message',
                    label: 'Message',
                    fieldtype: 'Text Editor',
                    // reqd: 1,
                  },
                ],
                primary_action_label: __('Send'),
                primary_action(values) {
                  send_message(values);
                  dialog.hide();
                },
                secondary_action_label: __('Discard'),
                secondary_action() {
                  dialog.hide();
                },

                // size: 'small',
                minimizable: true,
              });
              dialog.show();
            } else {
              frappe.msgprint({
                title: __('Send raven'),
                indicator: 'blue',
                message: __('No channels found'),
              });
            }
          };

          let get_channels = () => {
            return frappe.call({
              method:
                'raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list',
              args: {
                hide_archived: true,
              },
              callback: function (r) {
                if (r && r.message) {
                  return r.message;
                }
              },
            });
          };

          let send_message = (values) => {
            let channel = values.channel;
            // get message from values.message and clean it up, remove html tags
            let message = values.message.replace(/<[^>]*>?/gm, '');

            frappe.db
              .insert({
                doctype: 'Raven Message',
                channel_id: channel,
                text: message,
                message_type: 'Text',
                link_doctype: frm.doctype,
                link_document: frm.docname,
              })
              .then((doc) => {
                frappe.show_alert({
                  message: __('Message sent'),
                  indicator: 'green',
                });
              })
              .catch((err) => {
                frappe.throw(__('Error sending message'));
              });
          };

          let send_raven = () => {
            get_channels().then((channels) => send_message_modal(channels));
          };

          var timeline = frm.footer.frm.timeline;
          timeline.add_action_button(
            __('Send raven'),
            send_raven,
            'share',
            'btn-secondary'
          );
        }
      },
    });
  });
});
