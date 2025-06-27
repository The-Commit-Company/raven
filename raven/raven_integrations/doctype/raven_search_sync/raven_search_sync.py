# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import json
import frappe
from frappe.model.document import Document
from raven.typesense_setup import get_typesense_client


class RavenSearchSync(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		action: DF.Literal["Create", "Update", "Delete"]
		content: DF.JSON | None
		document_id: DF.Data
		reference_doctype: DF.Link
	# end: auto-generated types

	def before_insert(self):
		frappe.db.delete(
			"Raven Search Sync",
			{
				"reference_doctype": self.reference_doctype,
				"document_id": self.document_id,
			},
		)

def sync_to_search(doctype, docname, action, content):
    doc = frappe.new_doc("Raven Search Sync")
    doc.reference_doctype = doctype
    doc.document_id = docname
    doc.action = action
    doc.content = content
    doc.insert()

def update_search_index():
    """Process pending search sync records and update Typesense index"""

    raven_settings = frappe.get_cached_doc("Raven Settings")
    if not raven_settings.enable_typesense:
        return

    client = get_typesense_client(admin=True)

    try:
        if frappe.db.count("Raven Search Sync") == 0:
            return {"message": "No pending search sync records"}

        # Get all pending sync records
        raven_search_sync = frappe.qb.DocType("Raven Search Sync")

        query = (frappe.qb.from_(raven_search_sync)
                .select(raven_search_sync.reference_doctype, 
                        raven_search_sync.document_id, 
                        raven_search_sync.action, 
                        raven_search_sync.content)
                .orderby(raven_search_sync.reference_doctype, raven_search_sync.action))

        sync_records = query.run()

        # Group records by doctype and action for batch processing
        grouped_operations = {
            "Create": {
                "messages": [],
                "channels": [],
                "users": []
            },
            "Update": {
                "messages": [],
                "channels": [],
                "users": []
            },
            "Delete": {
                "messages": [],
                "channels": [],
                "users": []
            }
        }

        for record in sync_records:
            match record[0]:
                case "Raven Message":
                    collection = "messages"
                case "Raven Channel":
                    collection = "channels"
                case "Raven User":
                    collection = "users"
                case _:
                    continue
            id = record[1]
            action = record[2]
            content = json.loads(record[3])

            grouped_operations[action][collection].append({
                "id": id,
                **content
            })

        for action, collections in grouped_operations.items():
            match action:
                case "Create":
                    _sync_to_typesense(client, collections)
                case "Update":
                    _sync_to_typesense(client, collections)
                case "Delete":
                    _delete_from_typesense(client, collections)

        frappe.db.delete("Raven Search Sync")
        frappe.db.commit()

    except Exception as e:
        frappe.log_error(f"Error in update_search_index: {str(e)}")
        return {"error": str(e)}



def _sync_to_typesense(client, collections):
    """Create documents in Typesense"""
    for collection, documents in collections.items():
        if documents:
            client.collections[collection].documents.import_(documents, {"action": "emplace"})

def _delete_from_typesense(client, collections):
    """Delete documents from Typesense"""
    for collection, documents in collections.items():
        if documents:
       	    client.collections[collection].documents.delete({'filter_by': f"id:{[doc['id'] for doc in documents]}"})

     