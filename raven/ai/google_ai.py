import json

import frappe
from google.api_core.client_options import ClientOptions
from google.cloud import documentai, documentai_v1
from google.oauth2 import service_account


@frappe.whitelist()
def get_document_ai_processors():
	"""
	Get the list of document AI processors available for the Google Cloud project.
	"""
	frappe.has_permission("Raven Settings", ptype="read", throw=True)

	raven_settings = frappe.get_single("Raven Settings")
	if not raven_settings.enable_google_apis:
		return []

	location = raven_settings.google_processor_location

	key = json.loads(raven_settings.get_password("google_service_account_json_key"))

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
				{"id": processor.name, "display_name": processor.display_name, "type": processor.type_}
			)

	return processors


@frappe.whitelist()
def create_default_document_processor():
	"""
	Create a default document processor for the Google Cloud project.
	"""
	raven_settings = frappe.get_single("Raven Settings")
	if not raven_settings.enable_google_apis:
		return

	location = raven_settings.google_processor_location

	key = json.loads(raven_settings.get_password("google_service_account_json_key"))

	credentials = service_account.Credentials.from_service_account_info(key)

	client_options = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")
	client = documentai.DocumentProcessorServiceClient(
		credentials=credentials, client_options=client_options
	)

	parent = client.common_location_path(raven_settings.google_project_id, location)

	processor = client.create_processor(
		parent=parent,
		processor=documentai.Processor(
			display_name="Default Document Processor", type_="FORM_PARSER_PROCESSOR"
		),
	)

	return {"id": processor.name, "display_name": processor.display_name, "type": processor.type_}


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

	file_doc = frappe.get_doc("File", {"file_url": file_path})

	content = file_doc.get_content()

	raven_settings = frappe.get_single("Raven Settings")
	if not raven_settings.enable_google_apis:
		return []

	location = raven_settings.google_processor_location

	key = json.loads(raven_settings.get_password("google_service_account_json_key"))

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
