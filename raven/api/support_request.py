import json

import frappe
import requests
from frappe import _


@frappe.whitelist(methods=["POST"])
def submit_support_request(
	email,
	ticket_type,
	subject,
	description,
	status="Open",
):
	"""
	Submit a support ticket using Frappe's web form API.
	"""

	payload = {
		"data": json.dumps(
			{
				"raised_by": email,
				"subject": subject,
				"ticket_type": ticket_type,
				"description": description,
				"status": status,
				"doctype": "HD Ticket",
				"web_form_name": "support-ticket",
				"via_customer_portal": 1,
			}
		),
		"web_form": "support-ticket",
	}

	response = requests.post(
		"https://community.ravenapp.cloud/api/method/frappe.website.doctype.web_form.web_form.accept",
		data=payload,
		headers={"Content-Type": "application/x-www-form-urlencoded"},
	)

	if response.status_code == 200:
		return "Ticket submitted successfully"
	else:
		frappe.throw(_("Failed to submit the ticket"))
