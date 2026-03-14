import inspect
import json
from typing import Any, Callable

import frappe

# Import the SDK directly - no fallback needed
from agents import FunctionTool
from frappe import _, client

from raven.ai.function_types import DOCTYPE_SCOPED_FUNCTION_TYPES
from raven.ai.functions import (
	cancel_document,
	create_document,
	create_documents,
	delete_document,
	delete_documents,
	get_amended_document,
	get_documents,
	get_value,
	set_value,
	submit_document,
	update_document,
	update_documents,
)

STANDARD_FUNCTION_PATHS = {
	function_type: f"raven.ai.sdk_tools.handle_{frappe.scrub(function_type)}"
	for function_type in DOCTYPE_SCOPED_FUNCTION_TYPES
}

FUNCTIONS_USING_RAVEN_CONFIG = {
	"Create Document",
	"Create Multiple Documents",
	"Update Document",
	"Update Multiple Documents",
}


def create_raven_tools(bot) -> list[FunctionTool]:
	"""
	Create function tools for Raven bot

	Args:
	    bot: Raven bot document

	Returns:
	    List[FunctionTool]: List of function tools
	"""
	tools = []

	# Get the bot functions - use bot_functions instead of functions
	if hasattr(bot, "bot_functions") and bot.bot_functions:

		for func in bot.bot_functions:
			# Log function details

			try:
				# Get function details from Raven AI Function (not Raven Bot Functions)
				function_doc = frappe.get_doc("Raven AI Function", func.function)

				# Check if function has a valid path for execution
				function_path = None

				# For Custom Function, use the function_path directly
				if function_doc.type == "Custom Function":
					if not hasattr(function_doc, "function_path") or not function_doc.function_path:
						continue
					function_path = function_doc.function_path
				else:
					# For standard types like "Get List", generate a function path for built-in handlers
					function_path = STANDARD_FUNCTION_PATHS.get(function_doc.type)
					if not function_path:
						continue

				# Create a function tool for this function
				if function_doc:
					# Get params from function document
					params = {}
					if hasattr(function_doc, "get_params") and callable(function_doc.get_params):
						params = function_doc.get_params()
					elif hasattr(function_doc, "params") and function_doc.params:
						try:
							params = json.loads(function_doc.params)
						except Exception as e:
							frappe.log_error(
								"SDK Functions Debug", f"Error parsing params for {function_doc.name}: {str(e)}"
							)

					# Remove additionalProperties from params if present to avoid strict schema errors
					if "additionalProperties" in params:
						del params["additionalProperties"]

					# Check if this is a standard type that needs reference_doctype
					extra_args = {}
					if (
						function_doc.type in DOCTYPE_SCOPED_FUNCTION_TYPES
						and hasattr(function_doc, "reference_doctype")
						and function_doc.reference_doctype
					):
						extra_args["reference_doctype"] = function_doc.reference_doctype

					if getattr(function_doc, "allow_any_doctype", 0):
						extra_args["allow_any_doctype"] = True

					if function_doc.type in FUNCTIONS_USING_RAVEN_CONFIG:
						extra_args["raven_function_name"] = function_doc.name

					tool = create_function_tool(
						function_doc.function_name,
						function_doc.description,
						function_path,  # Utiliser la variable function_path définie plus haut
						params,
						extra_args=extra_args,
					)

					if tool:
						tools.append(tool)

			except Exception as e:
				frappe.log_error("SDK Functions Debug", f"Error processing function {func.function}: {str(e)}")

	return tools


def create_function_tool(
	name: str,
	description: str,
	function_name: str,
	parameters: dict[str, Any],
	extra_args: dict[str, Any] = None,
) -> FunctionTool:
	"""
	Create a FunctionTool for Raven functions

	Args:
	    name: Tool name
	    description: Tool description
	    function_name: Function name to call
	    parameters: Function parameters schema
	    extra_args: Extra arguments to pass to the function

	Returns:
	    FunctionTool: Function tool
	"""

	# Get the actual function to call
	function = get_function_from_name(function_name)

	if not function:
		return None

	try:
		# Based on the OpenAI Agents SDK documentation, we need to create an async invoke handler
		# Store extra_args in a closure
		_extra_args = extra_args or {}
		_function = function

		# Create a tracking mechanism for duplicate requests
		import hashlib
		from datetime import datetime, timedelta

		# Create a simple cache to prevent duplicate function executions
		_request_cache = {}
		_cache_ttl = 5  # seconds - short TTL to prevent duplicates in same conversation

		# Create an async handler that will invoke our function
		async def on_invoke_tool(ctx, args_json: str) -> str:
			try:
				# Create a unique hash for this request to detect duplicates
				request_hash = hashlib.md5(args_json.encode()).hexdigest()
				now = datetime.now()

				# Check if we've seen this exact request recently (deduplication)
				if request_hash in _request_cache:
					last_time, cached_result = _request_cache[request_hash]
					# If the request was made very recently, return cached result
					if now - last_time < timedelta(seconds=_cache_ttl):
						return cached_result

				# Parse arguments from JSON
				args_dict = json.loads(args_json)

				# Add extra arguments from function configuration
				for key, value in _extra_args.items():
					if key not in args_dict:
						args_dict[key] = value

				# Set context for reference_doctype
				if "reference_doctype" in _extra_args:
					frappe.flags.current_function_doctype = _extra_args["reference_doctype"]

				# Call the function
				result = _function(**args_dict)

				# Convert result to string (JSON)
				result_str = ""
				if isinstance(result, dict) or isinstance(result, list):
					# Use default=str to handle datetime objects
					result_str = json.dumps(result, default=str)
				else:
					result_str = str(result)

				# Store in cache to prevent duplicate executions
				_request_cache[request_hash] = (now, result_str)

				# Clean up old cache entries
				for hash_key in list(_request_cache.keys()):
					if now - _request_cache[hash_key][0] > timedelta(seconds=_cache_ttl * 2):
						del _request_cache[hash_key]

				return result_str
			except Exception as e:
				frappe.log_error("SDK Functions Debug", f"Error in on_invoke_tool: {str(e)}")
				return json.dumps({"error": str(e)})

		# Create and return the tool
		tool = FunctionTool(
			name=name,
			description=description,
			params_json_schema=parameters,
			on_invoke_tool=on_invoke_tool,
			strict_json_schema=False,  # Disable strict mode to allow more flexible schemas
		)

		return tool
	except Exception as e:
		frappe.log_error("SDK Functions Debug", f"Error creating FunctionTool for {name}: {str(e)}")
		return None


def get_function_from_name(function_name: str) -> Callable:
	"""
	Get a function from its name

	Args:
	    function_name: Fully qualified function name (module.function)

	Returns:
	    Callable: Function
	"""

	try:
		# Split module and function
		try:
			module_name, func_name = function_name.rsplit(".", 1)
		except ValueError:
			frappe.log_error(
				"SDK Functions Debug",
				f"Invalid function name format: {function_name}. Should be 'module.function'",
			)
			return None

		# Import module
		try:
			module = __import__(module_name, fromlist=[func_name])
		except ImportError as ie:
			frappe.log_error("SDK Functions Debug", f"Module import error: {str(ie)}")
			return None

		# Check for available attributes in the module
		try:
			dir(module)
		except Exception as e:
			frappe.log_error("SDK Functions Debug", f"Error getting module attributes: {str(e)}")

		# Get function
		try:
			function = getattr(module, func_name)
		except AttributeError as ae:
			frappe.log_error("SDK Functions Debug", f"Function not found in module: {str(ae)}")
			return None

		# Verify the object is callable
		if not callable(function):
			return None

		return function

	except Exception as e:
		frappe.log_error(
			"SDK Functions Debug", f"Unexpected error getting function {function_name}: {str(e)}"
		)
		return None


# Function wrapper to adapt Frappe functions to Agents SDK
def wrap_frappe_function(func: Callable) -> Callable:
	"""
	Wrap a Frappe function to handle exceptions

	Args:
	    func: Function to wrap

	Returns:
	    Callable: Wrapped function
	"""

	def wrapper(*args, **kwargs):
		try:
			result = func(*args, **kwargs)

			# Convert Frappe document to dictionary if needed
			if hasattr(result, "as_dict"):
				result = result.as_dict()

			# If result is a list of Frappe documents, convert each to dictionary
			elif isinstance(result, list) and result and hasattr(result[0], "as_dict"):
				result = [item.as_dict() if hasattr(item, "as_dict") else item for item in result]

			return {"success": True, "result": result}
		except Exception as e:
			frappe.log_error(f"Error in function {func.__name__}: {e}")
			return {"success": False, "error": str(e)}

	# Copy function metadata
	wrapper.__name__ = func.__name__
	wrapper.__doc__ = func.__doc__
	wrapper.__module__ = func.__module__
	wrapper.__signature__ = inspect.signature(func)

	return wrapper


# Standard CRUD function generators
def create_get_function(doctype: str) -> Callable:
	"""
	Create a get function for a doctype

	Args:
	    doctype: DocType name

	Returns:
	    Callable: Function to get a document
	"""

	def get_doc(name: str, **kwargs):
		"""
		Get a document

		Args:
		    name: Name of the document

		Returns:
		    dict: Document data
		"""
		doc = client.get(doctype, name)
		return doc

	get_doc.__name__ = f"get_{doctype.lower().replace(' ', '_')}"
	get_doc.__doc__ = f"Get a {doctype} document"

	return wrap_frappe_function(get_doc)


def create_create_function(doctype: str) -> Callable:
	"""
	Create a function to create a document

	Args:
	    doctype: DocType name

	Returns:
	    Callable: Function to create a document
	"""

	def create_doc(**kwargs):
		"""
		Create a document

		Args:
		    **kwargs: Document fields

		Returns:
		    dict: Created document
		"""
		doc = frappe.get_doc({"doctype": doctype, **kwargs})
		doc.insert()
		return doc

	create_doc.__name__ = f"create_{doctype.lower().replace(' ', '_')}"
	create_doc.__doc__ = f"Create a {doctype} document"

	return wrap_frappe_function(create_doc)


def create_update_function(doctype: str) -> Callable:
	"""
	Create a function to update a document

	Args:
	    doctype: DocType name

	Returns:
	    Callable: Function to update a document
	"""

	def update_doc(name: str, **kwargs):
		"""
		Update a document

		Args:
		    name: Name of the document
		    **kwargs: Fields to update

		Returns:
		    dict: Updated document
		"""
		doc = frappe.get_doc(doctype, name)

		# Update fields
		for key, value in kwargs.items():
			if hasattr(doc, key):
				setattr(doc, key, value)

		doc.save()
		return doc

	update_doc.__name__ = f"update_{doctype.lower().replace(' ', '_')}"
	update_doc.__doc__ = f"Update a {doctype} document"

	return wrap_frappe_function(update_doc)


def create_delete_function(doctype: str) -> Callable:
	"""
	Create a function to delete a document

	Args:
	    doctype: DocType name

	Returns:
	    Callable: Function to delete a document
	"""

	def delete_doc(name: str):
		"""
		Delete a document

		Args:
		    name: Name of the document

		Returns:
		    dict: Result of deletion
		"""
		frappe.delete_doc(doctype, name)
		return {"message": f"{doctype} {name} deleted successfully"}

	delete_doc.__name__ = f"delete_{doctype.lower().replace(' ', '_')}"
	delete_doc.__doc__ = f"Delete a {doctype} document"

	return wrap_frappe_function(delete_doc)


def create_list_function(doctype: str) -> Callable:
	"""
	Create a function to list documents

	Args:
	    doctype: DocType name

	Returns:
	    Callable: Function to list documents
	"""

	def list_docs(
		filters: dict = None, fields: list = None, limit: int = 100, order_by: str = "modified desc"
	):
		"""
		List documents

		Args:
		    filters: Filters to apply
		    fields: Fields to return
		    limit: Maximum number of documents to return
		    order_by: Order by clause

		Returns:
		    list: List of documents
		"""
		if not fields:
			fields = ["name", "modified"]

		result = frappe.get_list(
			doctype, filters=filters, fields=fields, limit_page_length=limit, order_by=order_by
		)

		return result

	list_docs.__name__ = f"list_{doctype.lower().replace(' ', '_')}"
	list_docs.__doc__ = f"List {doctype} documents"

	return wrap_frappe_function(list_docs)


# Built-in handlers for standard function types


def resolve_function_doctype(doctype=None, reference_doctype=None, allow_any_doctype=False):
	"""Resolve the target DocType for a function call."""
	# Get the reference doctype from function configuration
	resolved_doctype = reference_doctype or frappe.flags.get("current_function_doctype")

	if allow_any_doctype:
		resolved_doctype = doctype or resolved_doctype
	elif doctype and doctype != resolved_doctype:
		return None, _("This function is restricted to DocType '{0}'.").format(resolved_doctype)

	if not resolved_doctype:
		return None, _("No DocType provided. Please specify a valid DocType.")

	# Validate the doctype exists
	if not frappe.db.exists("DocType", resolved_doctype):
		return None, _("DocType '{0}' does not exist.").format(resolved_doctype)

	return resolved_doctype, None


def get_raven_function_config(raven_function_name=None):
	"""Fetch the Raven AI Function document when handlers need its metadata."""
	if not raven_function_name:
		return None

	try:
		return frappe.get_cached_doc("Raven AI Function", raven_function_name)
	except Exception:
		return None


def build_payload_from_kwargs(data=None, excluded_keys=None, **kwargs):
	"""Build a payload from keyword args when the schema is field-based."""
	# If data is not provided, build it from kwargs
	if data is not None:
		return data

	excluded_keys = set(excluded_keys or [])
	payload = {}
	for key, value in kwargs.items():
		if key not in excluded_keys:
			payload[key] = value

	return payload


def handle_get_list(
	filters=None,
	fields=None,
	limit=20,
	order_by="modified desc",
	doctype=None,
	reference_doctype=None,
	allow_any_doctype=False,
):
	"""Get a list of documents from a doctype."""

	try:
		resolved_doctype, error = resolve_function_doctype(
			doctype=doctype,
			reference_doctype=reference_doctype,
			allow_any_doctype=allow_any_doctype,
		)
		if error:
			return {"success": False, "error": error}

		# Get the meta for this doctype to validate fields
		meta = frappe.get_meta(resolved_doctype)
		valid_fields = ["name", "creation", "modified", "modified_by", "owner", "docstatus"]
		for df in meta.fields:
			valid_fields.append(df.fieldname)

		# Set default fields if not provided
		if not fields:
			fields = ["name", "modified"]

		# Validate fields exist in doctype
		filtered_fields = []
		invalid_fields = []
		for field in fields:
			if field in valid_fields:
				filtered_fields.append(field)
			else:
				invalid_fields.append(field)

		if invalid_fields:
			# Add a warning but continue with valid fields
			warning = _("Fields {0} do not exist in DocType '{1}' and were ignored.").format(
				", ".join(invalid_fields), resolved_doctype
			)

			# If all fields are invalid, use name and modified
			if not filtered_fields:
				filtered_fields = ["name", "modified"]
		else:
			warning = None

		# If filters provided, make sure field names are valid
		if filters and isinstance(filters, dict):
			cleaned_filters = {}
			invalid_filter_fields = []

			for key, value in filters.items():
				# Handle special operators like >, <, >=, etc.
				base_field = key.split()[0] if " " in key else key

				if base_field in valid_fields:
					cleaned_filters[key] = value
				else:
					invalid_filter_fields.append(base_field)

			if invalid_filter_fields:
				filters = cleaned_filters
				# Add to warning message
				filter_warning = _("Filter fields {0} do not exist in DocType '{1}' and were ignored.").format(
					", ".join(invalid_filter_fields), resolved_doctype
				)
				warning = f"{warning}\n{filter_warning}" if warning else filter_warning

		# Get list of documents with validated fields
		result = frappe.get_all(
			resolved_doctype,
			filters=filters,
			fields=filtered_fields,
			limit_page_length=limit,
			order_by=order_by,
		)

		# Ensure all datetime objects are converted to strings
		import datetime

		for item in result:
			for key, value in item.items():
				if isinstance(value, (datetime.datetime, datetime.date, datetime.time)):
					item[key] = str(value)

		response = {"success": True, "result": result}

		# Add warning if applicable
		if warning:
			response["warning"] = warning

		# Suggest valid fields to help the AI learn
		response["valid_fields"] = valid_fields[:20]  # Show first 20 fields to avoid overflow
		if len(valid_fields) > 20:
			response["valid_fields_note"] = f"Showing first 20 of {len(valid_fields)} available fields"

		return response
	except Exception as e:
		frappe.log_error("SDK Functions Debug", f"Error in handle_get_list: {str(e)}")
		return {"success": False, "error": str(e)}


def handle_get_document(
	document_id, doctype=None, reference_doctype=None, allow_any_doctype=False
):
	"""Get a document by ID."""
	try:
		resolved_doctype, error = resolve_function_doctype(
			doctype=doctype,
			reference_doctype=reference_doctype,
			allow_any_doctype=allow_any_doctype,
		)
		if error:
			return {"success": False, "error": error}

		# Validate document exists
		if not frappe.db.exists(resolved_doctype, document_id):
			return {
				"success": False,
				"error": _("Document '{0}' not found in DocType '{1}'.").format(document_id, resolved_doctype),
			}

		try:
			# Get document
			doc = frappe.get_doc(resolved_doctype, document_id)
			doc.check_permission()
			doc.apply_fieldlevel_read_permissions()

			# Convert to dict
			if hasattr(doc, "as_dict"):
				doc_dict = doc.as_dict()
			else:
				doc_dict = {
					key: getattr(doc, key)
					for key in dir(doc)
					if not key.startswith("_") and not callable(getattr(doc, key))
				}

			# Get valid fields for reference
			meta = frappe.get_meta(resolved_doctype)
			valid_fields = ["name", "creation", "modified", "modified_by", "owner", "docstatus"]
			for df in meta.fields:
				valid_fields.append(df.fieldname)

			return {
				"success": True,
				"result": doc_dict,
				# Show first 20 fields to avoid overflow
				"valid_fields": valid_fields[:20],
			}
		except frappe.DoesNotExistError:
			return {
				"success": False,
				"error": _("Document '{0}' not found in DocType '{1}'.").format(document_id, resolved_doctype),
			}
	except Exception as e:
		frappe.log_error("SDK Functions Debug", f"Error in handle_get_document: {str(e)}")
		return {"success": False, "error": str(e)}


def handle_get_multiple_documents(
	document_ids, doctype=None, reference_doctype=None, allow_any_doctype=False
):
	"""Get multiple documents by ID."""
	resolved_doctype, error = resolve_function_doctype(
		doctype=doctype,
		reference_doctype=reference_doctype,
		allow_any_doctype=allow_any_doctype,
	)
	if error:
		return {"success": False, "error": error}

	return get_documents(resolved_doctype, document_ids)


def handle_get_value(
	filters=None, fieldname="name", doctype=None, reference_doctype=None, allow_any_doctype=False
):
	"""Get one or more field values from a document."""
	resolved_doctype, error = resolve_function_doctype(
		doctype=doctype,
		reference_doctype=reference_doctype,
		allow_any_doctype=allow_any_doctype,
	)
	if error:
		return {"success": False, "error": error}

	return get_value(resolved_doctype, filters=filters, fieldname=fieldname)


def handle_set_value(
	document_id=None,
	fieldname=None,
	value=None,
	doctype=None,
	reference_doctype=None,
	allow_any_doctype=False,
):
	"""Set one or more field values on a document."""
	resolved_doctype, error = resolve_function_doctype(
		doctype=doctype,
		reference_doctype=reference_doctype,
		allow_any_doctype=allow_any_doctype,
	)
	if error:
		return {"success": False, "error": error}

	return set_value(resolved_doctype, document_id, fieldname, value)


def handle_create_document(
	data=None,
	doctype=None,
	reference_doctype=None,
	allow_any_doctype=False,
	raven_function_name=None,
	**kwargs,
):
	"""Create a document."""
	resolved_doctype, error = resolve_function_doctype(
		doctype=doctype,
		reference_doctype=reference_doctype,
		allow_any_doctype=allow_any_doctype,
	)
	if error:
		return {"success": False, "error": error}

	data = build_payload_from_kwargs(
		data=data,
		excluded_keys=["doctype", "reference_doctype", "allow_any_doctype", "raven_function_name"],
		**kwargs,
	)
	function_doc = get_raven_function_config(raven_function_name)
	return create_document(resolved_doctype, data, function_doc)


def handle_create_multiple_documents(
	data=None,
	doctype=None,
	reference_doctype=None,
	allow_any_doctype=False,
	raven_function_name=None,
):
	"""Create multiple documents."""
	resolved_doctype, error = resolve_function_doctype(
		doctype=doctype,
		reference_doctype=reference_doctype,
		allow_any_doctype=allow_any_doctype,
	)
	if error:
		return {"success": False, "error": error}

	if data is None:
		return {
			"success": False,
			"error": _("No data provided. Please specify documents to create."),
		}

	function_doc = get_raven_function_config(raven_function_name)
	return create_documents(resolved_doctype, data, function_doc)


def handle_update_document(
	document_id=None,
	data=None,
	doctype=None,
	reference_doctype=None,
	allow_any_doctype=False,
	raven_function_name=None,
	**kwargs,
):
	"""Update a document."""
	# Handle different parameter formats
	data = build_payload_from_kwargs(
		data=data,
		excluded_keys=[
			"document_id",
			"item_code",
			"item_name",
			"doctype",
			"reference_doctype",
			"allow_any_doctype",
			"raven_function_name",
		],
		**kwargs,
	)

	# Try to get document_id from different sources
	if not document_id:
		# Check if item_code was provided
		if "item_code" in kwargs:
			document_id = kwargs["item_code"]
		elif "item_name" in kwargs:
			document_id = kwargs["item_name"]

	resolved_doctype, error = resolve_function_doctype(
		doctype=doctype,
		reference_doctype=reference_doctype,
		allow_any_doctype=allow_any_doctype,
	)
	if error:
		return {"success": False, "error": error}

	function_doc = get_raven_function_config(raven_function_name)
	return update_document(resolved_doctype, document_id, data, function_doc)


def handle_update_multiple_documents(
	data=None,
	doctype=None,
	reference_doctype=None,
	allow_any_doctype=False,
	raven_function_name=None,
):
	"""Update multiple documents."""
	resolved_doctype, error = resolve_function_doctype(
		doctype=doctype,
		reference_doctype=reference_doctype,
		allow_any_doctype=allow_any_doctype,
	)
	if error:
		return {"success": False, "error": error}

	if data is None:
		return {
			"success": False,
			"error": _("No data provided. Please specify documents to update."),
		}

	function_doc = get_raven_function_config(raven_function_name)
	return update_documents(resolved_doctype, data, function_doc)


def handle_delete_document(
	document_id, doctype=None, reference_doctype=None, allow_any_doctype=False
):
	"""Delete a document."""
	resolved_doctype, error = resolve_function_doctype(
		doctype=doctype,
		reference_doctype=reference_doctype,
		allow_any_doctype=allow_any_doctype,
	)
	if error:
		return {"success": False, "error": error}

	return delete_document(resolved_doctype, document_id)


def handle_delete_multiple_documents(
	document_ids, doctype=None, reference_doctype=None, allow_any_doctype=False
):
	"""Delete multiple documents."""
	resolved_doctype, error = resolve_function_doctype(
		doctype=doctype,
		reference_doctype=reference_doctype,
		allow_any_doctype=allow_any_doctype,
	)
	if error:
		return {"success": False, "error": error}

	return delete_documents(resolved_doctype, document_ids)


def handle_submit_document(
	document_id, doctype=None, reference_doctype=None, allow_any_doctype=False
):
	"""Submit a document."""
	resolved_doctype, error = resolve_function_doctype(
		doctype=doctype,
		reference_doctype=reference_doctype,
		allow_any_doctype=allow_any_doctype,
	)
	if error:
		return {"success": False, "error": error}

	return submit_document(resolved_doctype, document_id)


def handle_cancel_document(
	document_id, doctype=None, reference_doctype=None, allow_any_doctype=False
):
	"""Cancel a document."""
	resolved_doctype, error = resolve_function_doctype(
		doctype=doctype,
		reference_doctype=reference_doctype,
		allow_any_doctype=allow_any_doctype,
	)
	if error:
		return {"success": False, "error": error}

	return cancel_document(resolved_doctype, document_id)


def handle_get_amended_document(
	document_id, doctype=None, reference_doctype=None, allow_any_doctype=False
):
	"""Get the amended version of a document."""
	resolved_doctype, error = resolve_function_doctype(
		doctype=doctype,
		reference_doctype=reference_doctype,
		allow_any_doctype=allow_any_doctype,
	)
	if error:
		return {"success": False, "error": error}

	return get_amended_document(resolved_doctype, document_id)
