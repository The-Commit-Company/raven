# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import frappe
from frappe.query_builder.functions import Count


class RavenChannelVisit(Document):
    pass


@frappe.whitelist()
def get_last_visit(channel_id):
    doc = frappe.db.get_value("Raven Channel Visit", {
                              "channel_id": channel_id, "user_id": frappe.session.user}, ["name", "last_visit"], as_dict=1)
    if doc:
        frappe.db.set_value("Raven Channel Visit", doc.name,
                            "last_visit", frappe.utils.now())
        frappe.db.commit()
        return doc.name
    else:
        doc = frappe.get_doc({"doctype": "Raven Channel Visit",
                              "channel_id": channel_id, "user_id": frappe.session.user, "last_visit": frappe.utils.now()}).insert()
        frappe.db.commit()
        return doc.name
