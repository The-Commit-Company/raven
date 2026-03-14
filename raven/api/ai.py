import frappe


@frappe.whitelist(methods=["POST"])
def stop_ai_request(channel_id: str):
	"""
	Stop AI request for the specified channel
	"""
	try:
		# Get job_id from cache
		job_id = frappe.cache().hget("ai_job_ids", channel_id)

		if not job_id:
			return {"success": False, "message": "No active AI request found for this channel"}

		# Stop the job
		job_doc = frappe.get_doc("RQ Job", job_id)
		job_doc.stop_job()

		# Remove job_id from cache
		frappe.cache().hdel("ai_job_ids", channel_id)

		# Publish clear AI event
		frappe.publish_realtime(
			"ai_event_clear",
			{
				"channel_id": channel_id,
				"stopped": True,
			},
			doctype="Raven Channel",
			docname=channel_id,
			after_commit=True,
		)

		# Publish success message
		frappe.publish_realtime(
			"ai_request_stopped",
			{
				"channel_id": channel_id,
				"message": "AI request has been stopped",
			},
			doctype="Raven Channel",
			docname=channel_id,
			after_commit=True,
		)

		return {"success": True, "message": "AI request stopped successfully"}

	except Exception as e:
		frappe.log_error(f"Error stopping AI request: {str(e)}", "Stop AI Request Error")
		return {"success": False, "message": f"Failed to stop AI request: {str(e)}"}


@frappe.whitelist(methods=["GET"])
def get_ai_request_status(channel_id: str):
	"""
	Get the status of the AI request for the specified channel
	"""
	try:
		# Get job_id from cache
		job_id = frappe.cache().hget("ai_job_ids", channel_id)

		if not job_id:
			return {"has_active_request": False, "job_id": None}

		# Check job status
		try:
			job_doc = frappe.get_doc("RQ Job", job_id)
			return {"has_active_request": True, "job_id": job_id, "status": job_doc.status}
		except frappe.DoesNotExistError:
			# Job does not exist, remove from cache
			frappe.cache().hdel("ai_job_ids", channel_id)
			return {"has_active_request": False, "job_id": None}

	except Exception as e:
		frappe.log_error("Get AI Request Status Error", f"Error getting AI request status: {str(e)}")
		return {"has_active_request": False, "job_id": None, "error": str(e)}
