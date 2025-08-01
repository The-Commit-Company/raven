# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import json
import frappe
from frappe.model.document import Document
from raven.api.typesense_sync import get_typesense_client


class RavenSearchSync(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		action: DF.Literal["Upsert", "Delete"]
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
    doc.deferred_insert()

def update_search_index():
    """Process pending search sync records and update Typesense index"""

    raven_settings = frappe.get_cached_doc("Raven Settings")
    if not raven_settings.enable_typesense:
        return

    client = get_typesense_client()

    try:
        if frappe.db.count("Raven Search Sync") == 0:
            return {"message": "No pending search sync records"}

        # Get all pending sync records
        # sync_records = frappe.get_all("Raven Search Sync", 
        #                              fields=["reference_doctype", "document_id", "action", "content"],
        #                              order_by="reference_doctype, action")

        sync_records = frappe.qb.get_query(
            "Raven Search Sync",
            fields=["reference_doctype", "document_id", "action", "content", "name"],
            order_by="reference_doctype, action",
            for_update=True
        ).run(as_dict=True)

        collection = f"{raven_settings.typesense_hash}_messages"

        # Group records by action for batch processing
        upsert_documents = []
        delete_documents = []

        for record in sync_records:
            document_id = record.document_id
            action = record.action
            content = json.loads(record.content)

            document = {
                "id": document_id,
                **content
            }

            if action == "Upsert":
                upsert_documents.append(document)
            elif action == "Delete":
                delete_documents.append(document)

        record_names = [record.name for record in sync_records]
        # Process upsert operations
        if upsert_documents:
            _sync_to_typesense(client, collection, upsert_documents)
            frappe.db.delete("Raven Search Sync", {
                "name": ("in", record_names),
                "action": "Upsert"
            })

        # Process delete operations
        if delete_documents:
            _delete_from_typesense(client, collection, delete_documents)
            frappe.db.delete("Raven Search Sync", {
                "name": ("in", record_names),
                "action": "Delete"
            })

        frappe.db.commit()
    except Exception as e:
        frappe.log_error(f"Error in update_search_index: {str(e)}")
        return {"error": str(e)}


def _sync_to_typesense(client, collection, documents):
    """Create/Update documents in Typesense"""
    client.collections[collection].documents.import_(documents, {"action": "emplace"})

def _delete_from_typesense(client, collection, documents):
    """Delete documents from Typesense"""
    document_ids = [doc['id'] for doc in documents]
    client.collections[collection].documents.delete({'filter_by': f"id:{document_ids}"})