// Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
// For license information, please see license.txt

frappe.ui.form.on("Raven Slack Import", {
    refresh(frm) {

        if (frm.doc.status === "Not Started") {
            frm.add_custom_button("Extract Data", () => {
                frm.call("unzip_files").then(() => {
                    frm.refresh()
                });
            });
        }

        if (frm.doc.status === "Staged") {
            frm.add_custom_button("Start Import", () => {
                frm.call("start_import").then(() => {
                    frm.refresh();
                });
            });
        }
    },
});
