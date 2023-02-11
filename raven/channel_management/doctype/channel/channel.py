# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Channel(Document):
    pass


@frappe.whitelist()
def get_user_data(user_id):

    user = frappe.qb.DocType('User')

    query = (
        frappe.qb.from_(user)
        .select(
            user.name,
            user.first_name,
            user.full_name,
            user.user_image
        )
        .where(user.name == user_id)
    )

    return query.run(as_dict=True)
