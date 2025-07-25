// Copyright (c) 2023, The Commit Company and contributors
// For license information, please see license.txt

frappe.ui.form.on("Raven Settings", {
    refresh: function (frm) {
        if (frm.doc.typesense_connection_timeout_seconds === 0) {
            frm.set_value('typesense_connection_timeout_seconds', 5);
            frm.save();
        }
    },
    sync_typesense: function (frm) {
        frm.call("run_typesense_sync").then((r) => {
            frappe.msgprint({
                title: "Typesense sync completed",
                message: "Typesense sync completed successfully.",
                indicator: "green",
            });
        }).catch((e) => {
            frappe.msgprint({
                title: "Typesense sync failed",
                message: "An error occurred during Typesense sync.",
                indicator: "red",
            });
        });
    }
});
