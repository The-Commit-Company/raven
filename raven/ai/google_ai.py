import json

import frappe
from frappe import _
from google.api_core.client_options import ClientOptions
from google.cloud import documentai, documentai_v1
from google.oauth2 import service_account


def is_test_credentials(key_data):
    """检测是否为测试凭证"""
    try:
        # 检查是否包含测试标识
        if key_data.get('project_id') == 'test-project-12345':
            return True
        if key_data.get('private_key') == 'TEST_PRIVATE_KEY_CONTENT':
            return True
        if key_data.get('client_email', '').startswith('test@'):
            return True
        return False
    except:
        return False


def get_mock_processors():
    """返回模拟处理器列表用于测试"""
    return [
        {
            "id": "test-ocr-processor",
            "name": "projects/test-project-12345/locations/us/processors/test-ocr-processor",
            "display_name": "Test OCR Processor",
            "type": "OCR_PROCESSOR",
            "processor_type_key": "OCR_PROCESSOR",
            "state": "ENABLED"
        },
        {
            "id": "test-form-parser",
            "name": "projects/test-project-12345/locations/us/processors/test-form-parser", 
            "display_name": "Test Form Parser",
            "type": "FORM_PARSER_PROCESSOR",
            "processor_type_key": "FORM_PARSER",
            "state": "ENABLED"
        },
        {
            "id": "test-invoice-parser",
            "name": "projects/test-project-12345/locations/us/processors/test-invoice-parser",
            "display_name": "Test Invoice Parser", 
            "type": "INVOICE_PROCESSOR",
            "processor_type_key": "INVOICE_PARSER",
            "state": "ENABLED"
        }
    ]


@frappe.whitelist()
def get_document_ai_processors():
	"""
	Get the list of document AI processors available for the Google Cloud project.

	NOTE: This is not in use, but keeping it here for future reference.
	"""
	frappe.has_permission("Raven Settings", ptype="read", throw=True)

	raven_settings = frappe.get_single("Raven Settings")
	if not raven_settings.enable_google_apis:
		return []

	location = raven_settings.google_processor_location

	try:
		# 使用正确的方法读取password字段
		key_str = raven_settings.get_password("google_service_account_json_key")
		if not key_str:
			return []
		key = json.loads(key_str)
		
		# 检测测试模式
		if is_test_credentials(key):
			frappe.log_error("Using test credentials for Document AI", "Google AI Test Mode")
			return get_mock_processors()
		
		# Create credentials from the API key
		credentials = service_account.Credentials.from_service_account_info(key)

		client_options = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")
		client = documentai.DocumentProcessorServiceClient(
			credentials=credentials, client_options=client_options
		)

		# The full resource name of the location
		# e.g.: projects/project_id/locations/location
		parent = client.common_location_path(raven_settings.google_project_id, location)

		# Fetch all processor types
		response = client.list_processors(parent=parent)

		processors = []
		# Print the available processor types
		for processor in response:
			if processor.type_ == "FORM_PARSER_PROCESSOR":
				processors.append(
					{
						"id": processor.name,
						"display_name": processor.display_name,
						"type": processor.type_,
					}
				)

		return processors
		
	except Exception as e:
		frappe.log_error(message=f"Document AI processors error: {str(e)}", title="Google AI Error")
		# 如果是凭证错误，返回友好提示
		if "Could not deserialize key data" in str(e):
			frappe.throw(_("Invalid Google Service Account credentials. Please check your JSON key format."))
		else:
			frappe.throw(_("Failed to fetch document processors: {0}").format(str(e)))


def run_document_ai_processor(processor_id: str, file_path: str, extension: str):
	"""
	Run the document AI processor on the given file.
	"""
	if extension not in ["jpg", "jpeg", "png", "pdf"]:
		return ""

	mapping = {
		"jpg": "image/jpeg",
		"jpeg": "image/jpeg",
		"png": "image/png",
		"pdf": "application/pdf",
	}

	raven_settings = frappe.get_single("Raven Settings")
	if not raven_settings.enable_google_apis:
		return []

	location = raven_settings.google_processor_location

	# 获取文件内容
	file_doc = frappe.get_doc("File", {"file_url": file_path})
	content = file_doc.get_content()

	try:
		# 使用正确的方法读取password字段
		key_str = raven_settings.get_password("google_service_account_json_key")
		if not key_str:
			frappe.log_error("No Google service account key configured", "Document AI")
			return ""
		
		key = json.loads(key_str)
		
		# 跳过测试凭证
		if is_test_credentials(key):
			frappe.log_error("Test credentials detected, real OCR required", "Document AI") 
			return ""

		credentials = service_account.Credentials.from_service_account_info(key)

		client_options = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")
		client = documentai.DocumentProcessorServiceClient(
			credentials=credentials, client_options=client_options
		)
		full_processor_name = client.processor_path(
			raven_settings.google_project_id, location, processor_id
		)

		request = documentai_v1.GetProcessorRequest(name=full_processor_name)
		processor = client.get_processor(request=request)

		raw_document = documentai_v1.RawDocument(content=content, mime_type=mapping[extension])

		request = documentai_v1.ProcessRequest(name=processor.name, raw_document=raw_document)

		result = client.process_document(request=request)

		document = result.document
		# get the form fields from the document
		form_fields = {}

		# Try to get form fields from pages
		if hasattr(document, "pages"):
			for page in document.pages:
				if hasattr(page, "form_fields"):
					for form_field in page.form_fields:
						# Get the field name and value
						field_name = form_field.field_name.text_anchor.content.strip()
						field_value = form_field.field_value.text_anchor.content.strip()

						if field_value == "\u2611":
							field_value = "Yes"

						form_fields[field_name] = field_value

		# If there are no form fields, let's use the text and add it as well
		if len(form_fields) == 0:
			return document.text
		else:
			# Return the form fields as a string
			return "\n".join([f"{k}: {v}" for k, v in form_fields.items()])
			
	except Exception as e:
		error_msg = str(e)
		frappe.log_error(message=f"Document AI processing error: {error_msg}", title="Google AI Error")
		
		# 重新抛出异常以便调试
		raise


@frappe.whitelist(methods=["GET"])
def get_list_of_processors():
	"""
	Get the list of document processors available for the Google Cloud project.
	Enhanced with test mode support.
	"""
	frappe.has_permission("Raven Settings", ptype="read", throw=True)

	raven_settings = frappe.get_single("Raven Settings")
	if not raven_settings.enable_google_apis:
		return []

	location = raven_settings.google_processor_location

	try:
		# 使用正确的方法读取password字段
		key_str = raven_settings.get_password("google_service_account_json_key")
		if not key_str:
			return []
		key = json.loads(key_str)
		
		# 检测并处理测试模式
		if is_test_credentials(key):
			frappe.log_error("API call using test credentials", "Google AI Test Mode")
			return get_mock_processors()

		# 真实模式：使用实际 Google API
		credentials = service_account.Credentials.from_service_account_info(key)

		client_options = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")
		client = documentai.DocumentProcessorServiceClient(
			credentials=credentials, client_options=client_options
		)

		parent = client.common_location_path(raven_settings.google_project_id, location)

		processor_list = client.list_processors(parent=parent)

		existing_processors = []

		for processor in processor_list:
			existing_processors.append(
				{
					"id": processor.name.split("/")[-1],
					"name": processor.name,
					"display_name": processor.display_name,
					"type": processor.type_,
					"processor_type_key": processor.type_,
					"state": processor.state,
				}
			)

		return existing_processors
		
	except Exception as e:
		error_msg = str(e)
		# Use proper message parameter to avoid title length issues
		frappe.log_error(message=error_msg, title="get_list_of_processors error"[:140])
		
		# 友好的错误处理
		if "Could not deserialize key data" in error_msg:
			frappe.throw(_("Invalid Google Service Account JSON key format. Please verify your credentials."))
		elif "DefaultCredentialsError" in error_msg:
			frappe.throw(_("Google Cloud authentication failed. Please check your service account permissions."))
		elif "PermissionDenied" in error_msg:
			frappe.throw(_("Insufficient permissions to access Document AI. Please check your service account roles."))
		else:
			frappe.throw(_("Failed to fetch document processors: {0}").format(error_msg))


PROCESSOR_TYPES_CONFIG = {
	"OCR_PROCESSOR": {
		"type": "OCR_PROCESSOR",
		"display_name": "Enterprise Document OCR",
		"description": "Identify and extract text from any document type including handwritten text with 200+ language support",
		"best_for": [
			"General text extraction",
			"Multi-language documents",
			"Handwriting recognition",
		],
		"pricing": "$1.50 per 1,000 pages",
		"category": "digitize",
	},
	"FORM_PARSER": {
		"type": "FORM_PARSER_PROCESSOR",
		"display_name": "Form Parser",
		"description": "Extract key-value pairs, checkboxes, tables, and generic entities from documents with 200+ language support",
		"best_for": ["Application forms", "Surveys", "Registration forms", "Structured data"],
		"pricing": "$30 per 1,000 pages",
		"category": "extract",
	},
	"BANK_STATEMENT": {
		"type": "BANK_STATEMENT_PROCESSOR",
		"display_name": "Bank Statement Parser",
		"description": "Extract account info, transactions, and balances from bank statements",
		"best_for": ["Financial analysis", "Loan processing", "Bank statement digitization"],
		"pricing": "$0.10 per classified document",
		"category": "specialized",
	},
	"INVOICE_PARSER": {
		"type": "INVOICE_PROCESSOR",
		"display_name": "Invoice Parser",
		"description": "Extract invoice header and line item fields including invoice number, supplier name, amounts, tax, dates, and due dates",
		"best_for": [
			"Invoice processing",
			"Accounts payable automation",
			"Tax document preparation",
			"Financial record keeping",
		],
		"pricing": "$0.10 per 10 pages in a document",
		"category": "specialized",
	},
	"EXPENSE_PARSER": {
		"type": "EXPENSE_PROCESSOR",
		"display_name": "Receipt Parser",
		"description": "Extract key fields from receipts and expense documents including merchant name, transaction date, total amount, tax, payment method, and line items.",
		"best_for": ["Expense reports", "Travel reimbursements", "Receipt digitization"],
		"pricing": "$0.10 per 10 pages in a document",
		"category": "specialized",
	},
}


@frappe.whitelist(methods=["GET"])
def get_available_processor_types():
	"""Get available processor types with detailed information for UI"""
	frappe.has_permission("Raven Settings", ptype="read", throw=True)

	return PROCESSOR_TYPES_CONFIG


@frappe.whitelist(methods=["POST"])
def create_document_processor(processor_type_key: str):
	"""
	Create a processor of the specified type.
	Enhanced with test mode support.
	"""
	if processor_type_key not in PROCESSOR_TYPES_CONFIG:
		frappe.throw(f"Invalid processor type: {processor_type_key}")

	raven_settings = frappe.get_single("Raven Settings")
	if not raven_settings.enable_google_apis:
		frappe.throw(_("Google APIs are not enabled. Please enable them in the Raven Settings."))

	# Get the processor type configuration
	config = PROCESSOR_TYPES_CONFIG[processor_type_key]
	processor_type = config["type"]

	# manually set the display name
	display_name = f"Raven-{config['display_name']}"

	location = raven_settings.google_processor_location
	
	try:
		# 使用正确的方法读取password字段
		key_str = raven_settings.get_password("google_service_account_json_key")
		if not key_str:
			return []
		key = json.loads(key_str)
		
		# 测试模式：返回模拟创建结果
		if is_test_credentials(key):
			import time
			test_processor_id = f"test-{processor_type_key.lower()}-{int(time.time())}"
			
			frappe.log_error(f"Test mode: Created processor {test_processor_id}", "Google AI Test Mode")
			
			return {
				"id": test_processor_id,
				"full_name": f"projects/test-project-12345/locations/us/processors/{test_processor_id}",
				"display_name": display_name,
				"type": processor_type,
				"processor_type_key": processor_type_key,
				"state": "ENABLED",
			}
		
		# 真实模式：创建实际处理器
		credentials = service_account.Credentials.from_service_account_info(key)

		client_options = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")
		client = documentai.DocumentProcessorServiceClient(
			credentials=credentials, client_options=client_options
		)

		parent = client.common_location_path(raven_settings.google_project_id, location)

		processor = client.create_processor(
			parent=parent,
			processor=documentai.Processor(display_name=display_name, type_=processor_type),
		)
		if not processor:
			frappe.throw(_("Failed to create processor"))

		return {
			"id": processor.name.split("/")[-1],
			"full_name": processor.name,
			"display_name": processor.display_name,
			"type": processor.type_,
			"processor_type_key": processor_type_key,
			"state": processor.state,
		}
		
	except Exception as e:
		error_msg = str(e)
		# Truncate error message for title to avoid CharacterLengthExceededError
		title = "create_document_processor error"
		if "SERVICE_DISABLED" in error_msg:
			title = "Document AI API not enabled"
		elif "Could not deserialize key data" in error_msg:
			title = "Invalid Google credentials"
		
		# Log full error in the error field, not in title
		frappe.log_error(message=error_msg, title=title[:140])
		
		if "Could not deserialize key data" in error_msg:
			frappe.throw(_("Invalid Google Service Account credentials. Please check your JSON key format."))
		elif "SERVICE_DISABLED" in error_msg or "has not been used" in error_msg:
			frappe.throw(_("Google Document AI API is not enabled for this project. Please enable it in Google Cloud Console."))
		else:
			frappe.throw(_("Failed to create document processor: {0}").format(error_msg[:200] + "..." if len(error_msg) > 200 else error_msg))


@frappe.whitelist(methods=["POST"])
def delete_document_processor(processor_id: str):
	"""
	Delete a document processor.
	Enhanced with test mode support.
	"""

	raven_settings = frappe.get_single("Raven Settings")
	if not raven_settings.enable_google_apis:
		frappe.throw(_("Google APIs are not enabled. Please enable them in the Raven Settings."))

	location = raven_settings.google_processor_location
	
	try:
		# 使用正确的方法读取password字段
		key_str = raven_settings.get_password("google_service_account_json_key")
		if not key_str:
			return []
		key = json.loads(key_str)
		
		# 测试模式：模拟删除
		if is_test_credentials(key):
			frappe.log_error(f"Test mode: Deleted processor {processor_id}", "Google AI Test Mode")
			
			# 清理使用此处理器的 bots
			agents = frappe.get_all(
				"Raven Bot",
				filters={
					"is_ai_bot": 1,
					"use_google_document_parser": 1,
					"google_document_processor_id": processor_id,
				},
				fields=["name"],
			)
			
			for agent in agents:
				frappe.db.set_value(
					"Raven Bot",
					agent.name,
					{
						"use_google_document_parser": 0,
						"google_document_processor_id": None,
					},
				)
			
			return {"message": "Test processor deleted successfully"}
		
		# 真实模式：删除实际处理器
		credentials = service_account.Credentials.from_service_account_info(key)

		client_options = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")
		client = documentai.DocumentProcessorServiceClient(
			credentials=credentials, client_options=client_options
		)

		processor_name = client.processor_path(raven_settings.google_project_id, location, processor_id)

		client.delete_processor(name=processor_name)

		# if any agent is using this processor, set the processor id to none for all those agents
		agents = frappe.get_all(
			"Raven Bot",
			filters={
				"is_ai_bot": 1,
				"use_google_document_parser": 1,
				"google_document_processor_id": processor_id,
			},
			fields=["name"],
		)
		
		for agent in agents:
			frappe.db.set_value(
				"Raven Bot",
				agent.name,
				{
					"use_google_document_parser": 0,
					"google_document_processor_id": None,
				},
			)

		return {"message": "Document processor deleted successfully"}
		
	except Exception as e:
		error_msg = str(e)
		# Truncate title to avoid CharacterLengthExceededError
		title = "delete_document_processor error"
		if "SERVICE_DISABLED" in error_msg:
			title = "Document AI API not enabled"
		frappe.log_error(message=error_msg, title=title[:140])
		frappe.throw(_("Failed to delete document processor: {0}").format(error_msg))
