import frappe
from frappe import _
from openai import OpenAI
import traceback


def get_open_ai_client():
	"""
	Get the OpenAI client
	"""

	raven_settings = frappe.get_cached_doc("Raven Settings")

	if not raven_settings.enable_ai_integration:
		frappe.throw(_("AI Integration is not enabled"))

	openai_api_key = raven_settings.get_password("openai_api_key")
	if openai_api_key:
		key_preview = openai_api_key[:4] + "..." + openai_api_key[-4:]
		frappe.log_error(f"DEBUG API KEY preview: {key_preview} (length: {len(openai_api_key)})", "Chatbot Debug")
	else:
		frappe.log_error("DEBUG API KEY: None", "Chatbot Debug")
	if not openai_api_key:
		frappe.throw(_("Chưa cấu hình OpenAI API Key"))

	client_args = {"api_key": openai_api_key.strip()}
	if getattr(raven_settings, "openai_organisation_id", None):
		client_args["organization"] = raven_settings.openai_organisation_id.strip()
	if getattr(raven_settings, "openai_project_id", None):
		client_args["project"] = raven_settings.openai_project_id.strip()

	client = OpenAI(**client_args)

	# Test kết nối bằng gọi models
	try:
		models = client.models.list()
		frappe.log_error("Đã lấy được models từ OpenAI", "OpenAI Models List")
	except Exception as e:
		frappe.log_error(traceback.format_exc(), "Lỗi kết nối OpenAI")
		frappe.throw(f"Lỗi kết nối OpenAI: {e}")

	return client


def get_openai_models():
	"""
	Get the available OpenAI models
	"""
	client = get_open_ai_client()
	return client.models.list()
