import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def get_timeline_documents():
    """
    Fetch all Timeline documents for timeline mentions
    """
    try:
        # Log the call for debugging
        frappe.log_error("Timeline API called successfully", "Timeline API Debug")
        
        # First, try to get actual timeline documents
        timeline_docs = frappe.get_all(
            "Timeline",
            fields=[
                "name",
                "experiment_id", 
                "timeline_task",
                "owner_name",
                "start_date",
                "end_date",
                "staus as status",  # Note: there's a typo in the original field name
                "modified"
            ],
            order_by="modified desc",
            limit=50  # Limit to recent 50 for performance
        )
        
        frappe.log_error(f"Found {len(timeline_docs)} timeline documents", "Timeline API Debug")
        
        # If no documents found, return sample data for testing
        if not timeline_docs:
            frappe.log_error("No timeline documents found, returning sample data", "Timeline API Debug")
            return [
                {
                    "name": "sample-timeline-1",
                    "experiment_id": "EXP-001",
                    "timeline_task": "Sample Task 1",
                    "owner_name": "Test User",
                    "start_date": "2024-01-01",
                    "end_date": "2024-01-31",
                    "status": "In Progress",
                    "modified": "2024-01-15 10:00:00"
                },
                {
                    "name": "sample-timeline-2", 
                    "experiment_id": "EXP-002",
                    "timeline_task": "Sample Task 2",
                    "owner_name": "Test User",
                    "start_date": "2024-02-01",
                    "end_date": "2024-02-28",
                    "status": "Completed",
                    "modified": "2024-02-15 14:30:00"
                }
            ]
        
        return timeline_docs
    except Exception as e:
        frappe.log_error(f"Error fetching timeline documents: {str(e)}", "Timeline API Error")
        # Return sample data even on error for testing
        return [
            {
                "name": "error-sample-timeline",
                "experiment_id": "EXP-ERROR",
                "timeline_task": "Error Sample Task",
                "owner_name": "System",
                "start_date": "2024-01-01",
                "end_date": "2024-01-31",
                "status": "Error",
                "modified": "2024-01-01 00:00:00"
            }
        ]

@frappe.whitelist(methods=["POST"])
def add_timeline_update(timeline_id, update_text):
    """
    Add an update to a specific timeline document with current datetime
    """
    try:
        # Check if timeline exists
        if not frappe.db.exists("Timeline", timeline_id):
            frappe.throw(_("Timeline document not found"), frappe.DoesNotExistError)
        
        # Get the timeline document
        timeline_doc = frappe.get_doc("Timeline", timeline_id)
        
        # Add the update to the updates table with current datetime
        update_with_datetime = f"[{frappe.utils.now()}] {update_text}"
        timeline_doc.append('updates', {
            'updates': update_with_datetime
        })
        
        # Save the document
        timeline_doc.save()
        
        return {
            "success": True,
            "message": "Update added successfully",
            "timeline_id": timeline_id,
            "update_text": update_with_datetime
        }
        
    except Exception as e:
        frappe.log_error(f"Error adding timeline update: {str(e)}")
        frappe.throw(_("Failed to add timeline update: {0}").format(str(e)))