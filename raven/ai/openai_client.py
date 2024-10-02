import frappe
from frappe import _
from openai import OpenAI


def get_open_ai_client():
	"""
	Get the OpenAI client
	"""

	raven_settings = frappe.get_cached_doc("Raven Settings")

	if not raven_settings.enable_ai_integration:
		frappe.throw(_("AI Integration is not enabled"))

	openai_api_key = raven_settings.get_password("openai_api_key")

	if raven_settings.openai_project_id:
		client = OpenAI(
			organization=raven_settings.openai_organisation_id,
			project=raven_settings.openai_project_id,
			api_key=openai_api_key,
		)

		return client

	else:
		client = OpenAI(api_key=openai_api_key, organization=raven_settings.openai_organisation_id)

		return client
