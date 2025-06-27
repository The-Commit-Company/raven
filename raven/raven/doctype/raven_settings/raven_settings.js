// Copyright (c) 2023, The Commit Company and contributors
// For license information, please see license.txt

frappe.ui.form.on("Raven Settings", {
    onload: function (frm) {
        if (frm.doc.connection_timeout_seconds === 0) {
            frm.set_value('connection_timeout_seconds', 5);
        }
    },
    setup_typesense: function (frm) {
        frm.call("run_typesense_setup").then((r) => {
            frappe.msgprint({
                title: "Typesense setup completed",
                indicator: "green",
            });
        }).catch((e) => {
            frappe.msgprint({
                title: "Typesense setup failed",
                message: e.message,
                indicator: "red",
            });
        });
    }
});
