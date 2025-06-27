import frappe
from frappe import _, client


def get_document(doctype: str, document_id: str):
	"""
	Get a document from the database
	"""
	# Use the frappe.client.get method to get the document with permissions (both read and field level read)
	return client.get(doctype, name=document_id)


def get_documents(doctype: str, document_ids: list):
	"""
	Get documents from the database
	"""
	docs = []
	for document_id in document_ids:
		# Use the frappe.client.get method to get the document with permissions applied
		docs.append(client.get(doctype, name=document_id))
	return docs


def create_document(doctype: str, data: dict, function=None):
	"""
	Create a document in the database
	"""
	if function:
		# Get any default values
		for param in function.parameters:
			if param.default_value:
				# Check if this value was not to be asked by the AI
				if param.do_not_ask_ai:
					data[param.fieldname] = param.default_value

				# Check if the value was not provided
				if not data.get(param.fieldname):
					data[param.fieldname] = param.default_value

	doc = frappe.get_doc({"doctype": doctype, **data})
	doc.insert()
	return {"document_id": doc.name, "message": "Document created", "doctype": doctype}


def create_documents(doctype: str, data: list, function=None):
	"""
	Create documents in the database
	"""
	docs = []
	for item in data:
		docs.append(create_document(doctype, item, function).get("document_id"))

	return {"documents": docs, "message": "Documents created", "doctype": doctype}


def update_document(doctype: str, document_id: str, data: dict, function=None):
	"""
	Update a document in the database
	"""
	if function:
		# Get any default values
		for param in function.parameters:
			if param.default_value:
				# Check if this value was not to be asked by the AI
				if param.do_not_ask_ai:
					data[param.fieldname] = param.default_value

				# Check if the value was not provided
				if not data.get(param.fieldname):
					data[param.fieldname] = param.default_value

	doc = frappe.get_doc(doctype, document_id)
	doc.update(data)
	doc.save()
	return {"document_id": doc.name, "message": "Document updated", "doctype": doctype}


def update_documents(doctype: str, data: dict, function=None):
	"""
	Update documents in the database
	"""
	updated_docs = []
	for document in data:
		document_without_id = document.copy()
		document_id = document_without_id.pop("document_id")
		updated_docs.append(
			update_document(doctype, document_id, document_without_id, function).get("document_id")
		)

	return {"document_ids": updated_docs, "message": "Documents updated", "doctype": doctype}


def delete_document(doctype: str, document_id: str):
	"""
	Delete a document from the database
	"""
	frappe.delete_doc(doctype, document_id)
	return {"document_id": document_id, "message": "Document deleted", "doctype": doctype}


def delete_documents(doctype: str, document_ids: list):
	"""
	Delete documents from the database
	"""
	for document_id in document_ids:
		frappe.delete_doc(doctype, document_id)
	return {"document_ids": document_ids, "message": "Documents deleted", "doctype": doctype}


def submit_document(doctype: str, document_id: str):
	"""
	Submit a document in the database
	"""
	doc = frappe.get_doc(doctype, document_id)
	doc.submit()
	return {
		"document_id": document_id,
		"message": f"{doctype} {document_id} submitted",
		"doctype": doctype,
	}


def cancel_document(doctype: str, document_id: str):
	"""
	Cancel a document in the database
	"""
	doc = frappe.get_doc(doctype, document_id)
	doc.cancel()
	return {
		"document_id": document_id,
		"message": f"{doctype} {document_id} cancelled",
		"doctype": doctype,
	}


def get_amended_document_id(doctype: str, document_id: str):
	"""
	Get the amended document for a given document
	"""
	amended_doc = frappe.db.exists(doctype, {"amended_from": document_id})
	if amended_doc:
		return amended_doc
	else:
		return {"message": f"{doctype} {document_id} is not amended"}


def get_amended_document(doctype: str, document_id: str):
	"""
	Get the amended document for a given document
	"""
	amended_doc = frappe.db.exists(doctype, {"amended_from": document_id})
	if amended_doc:
		return client.get(doctype, name=document_id)
	else:
		return {"message": f"{doctype} {document_id} is not amended", "doctype": doctype}


def attach_file_to_document(doctype: str, document_id: str, file_path: str):
	"""
	Attach a file to a document in the database
	"""
	if not frappe.db.exists(doctype, document_id):
		return {
			"document_id": document_id,
			"message": f"{doctype} with ID {document_id} not found",
			"doctype": doctype,
		}

	file = frappe.get_doc("File", {"file_url": file_path})

	if not file:
		frappe.throw(_("File not found"))

	newFile = frappe.get_doc(
		{
			"doctype": "File",
			"file_url": file_path,
			"attached_to_doctype": doctype,
			"attached_to_name": document_id,
			"folder": file.folder,
			"file_name": file.file_name,
			"is_private": file.is_private,
		}
	)
	newFile.insert()

	return {"document_id": document_id, "message": "File attached", "file_id": newFile.name}


def get_list(doctype: str, filters: dict = None, fields: list = None, limit: int = 20):
	"""
	Get a list of documents from the database
	"""
	if filters is None:
		filters = {}

	if fields is None:
		fields = ["*"]

	else:
		meta = frappe.get_meta(doctype)
		filtered_fields = ["name as document_id"]
		if "title" in fields:
			filtered_fields.append(meta.get_title_field())

		for field in fields:
			if meta.has_field(field) and field not in filtered_fields:
				filtered_fields.append(field)

	# Use the frappe.get_list method to get the list of documents
	return frappe.get_list(doctype, filters=filters, fields=filtered_fields, limit=limit)


def get_value(doctype: str, filters: dict = None, fieldname: str | list = "name"):
	"""
	Returns a value from a document

	        :param doctype: DocType to be queried
	        :param fieldname: Field to be returned (default `name`) - can be a list of fields(str) or a single field(str)
	        :param filters: dict or string for identifying the record
	"""
	meta = frappe.get_meta(doctype)

	if isinstance(fieldname, list):
		for field in fieldname:
			if not meta.has_field(field):
				return {"message": f"Field {field} does not exist in {doctype}"}

		return client.get_value(doctype, filters=filters, fieldname=fieldname)
	else:
		if not meta.has_field(fieldname):
			return {"message": f"Field {fieldname} does not exist in {doctype}"}

		return client.get_value(doctype, filters=filters, fieldname=fieldname)


def set_value(doctype: str, document_id: str, fieldname: str | dict, value: str = None):
	"""
	Set a value in a document

	        :param doctype: DocType to be queried
	        :param document_id: Document ID to be updated
	        :param fieldname: Field to be updated - fieldname string or JSON / dict with key value pair
	        :param value: value if fieldname is JSON

	        Example:
	                client.set_value("Customer", "CUST-00001", {"customer_name": "John Doe", "customer_email": "john.doe@example.com"}) OR
	                client.set_value("Customer", "CUST-00001", "customer_name", "John Doe")
	"""
	if isinstance(fieldname, dict):
		return client.set_value(doctype, document_id, fieldname)
	else:
		return client.set_value(doctype, document_id, fieldname, value)


def get_report_result(
	report_name: str,
	filters: dict = None,
	limit=None,
	user: str = None,
	ignore_prepared_report: bool = False,
	are_default_filters: bool = True,
):
	"""
	Run a report and return the columns and result
	"""
	# fetch the particular report
	report = frappe.get_doc("Report", report_name)
	if not report:
		return {
			"message": f"Report {report_name} is not present in the system. Please create the report first."
		}

	# run the report by using the get_data method and return the columns and result
	columns, data = report.get_data(
		filters=filters,
		limit=limit,
		user=user,
		ignore_prepared_report=ignore_prepared_report,
		are_default_filters=are_default_filters,
	)

	return {"columns": columns, "data": data}
