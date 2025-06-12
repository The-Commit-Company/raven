import frappe
from frappe.model.document import Document

class UserLabel(Document):
    # begin: auto-generated types
    # This code is auto-generated. Do not modify anything in this block.

    from typing import TYPE_CHECKING

    if TYPE_CHECKING:
        from frappe.types import DF

        label: DF.Data
        target_user: DF.Link | None
    # end: auto-generated types
    pass