import inspect
import json
from typing import Any, Callable

import frappe

# Import the SDK directly - no fallback needed
from agents import FunctionTool
from frappe import client


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
			try:
				# Get function details from Raven AI Function (not Raven Bot Functions)
				function_doc = frappe.get_doc("Raven AI Function", func.function)

				# Check if function has a valid path for execution
				function_path = None
				extra_args = {}

				# For Custom Function, use the function_path directly
				if function_doc.type == "Custom Function":
					if not hasattr(function_doc, "function_path") or not function_doc.function_path:
						continue
					function_path = function_doc.function_path
				else:
					# For standard types, create wrapper functions
					if function_doc.type in [
						"Get List",
						"Get Document",
						"Update Document",
						"Create Document",
						"Delete Document",
					]:
						# These need special handling because they exist as wrappers
						function_path = f"raven.ai.sdk_tools.handle_{function_doc.type.lower().replace(' ', '_')}"
					elif function_doc.type in [
						"Get Multiple Documents",
						"Create Multiple Documents",
						"Update Multiple Documents",
						"Delete Multiple Documents",
						"Submit Document",
						"Cancel Document",
						"Get Amended Document",
						"Get Value",
						"Set Value",
						"Attach File to Document",
					]:
						# These can use a generic wrapper that adapts parameters
						function_path = "raven.ai.sdk_tools.handle_generic_function"
						# Store the actual function to call
						extra_args["actual_function"] = {
							"Get Multiple Documents": "get_documents",
							"Create Multiple Documents": "create_documents",
							"Update Multiple Documents": "update_documents",
							"Delete Multiple Documents": "delete_documents",
							"Submit Document": "submit_document",
							"Cancel Document": "cancel_document",
							"Get Amended Document": "get_amended_document",
							"Get Value": "get_value",
							"Set Value": "set_value",
							"Attach File to Document": "attach_file_to_document",
						}.get(function_doc.type)
					else:
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
							# Error parsing params, continue with empty params
							pass

					# Remove additionalProperties from params if present to avoid strict schema errors
					if "additionalProperties" in params:
						del params["additionalProperties"]

					# Check if this is a standard type that needs reference_doctype
					if (
						function_doc.type
						in [
							"Get Document",
							"Get Multiple Documents",
							"Get List",
							"Create Document",
							"Create Multiple Documents",
							"Update Document",
							"Update Multiple Documents",
							"Delete Document",
							"Delete Multiple Documents",
						]
						and hasattr(function_doc, "reference_doctype")
						and function_doc.reference_doctype
					):
						extra_args["reference_doctype"] = function_doc.reference_doctype

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
				frappe.log_error(
					"Raven AI Functions Error", f"Error processing function {func.function}: {str(e)}"
				)

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
		# Error creating FunctionTool
		pass
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
		except ValueError as ve:
			# Invalid function name format
			return None

		# Import module
		try:
			module = __import__(module_name, fromlist=[func_name])
		except ImportError as ie:
			# Module import failed
			return None

		# Check for available attributes in the module
		try:
			available_attrs = dir(module)
		except Exception as e:
			# Error getting module attributes
			pass

		# Get function
		try:
			function = getattr(module, func_name)
		except AttributeError as ae:
			# Function not found in module
			return None

		# Verify the object is callable
		if not callable(function):
			return None

		return function

	except Exception as e:
		# Unexpected error getting function
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


def handle_get_list(
	filters=None, fields=None, limit=20, order_by="modified desc", reference_doctype=None
):
	"""
	Get a list of documents from a doctype

	Args:
	    filters (dict): Filters to apply
	    fields (list): Fields to include in the result
	    limit (int): Maximum number of documents to return
	    order_by (str): Order by clause
	    reference_doctype (str): DocType to get list from (provided by function configuration)

	Returns:
	    list: List of documents
	"""

	try:
		# Get the reference doctype from function configuration
		if not reference_doctype:
			# Try to get from context
			reference_doctype = frappe.flags.get("current_function_doctype")

		if not reference_doctype:
			return {
				"success": False,
				"error": "No reference doctype provided. Please specify a valid DocType.",
			}

		# Validate the doctype exists
		if not frappe.db.exists("DocType", reference_doctype):
			return {"success": False, "error": f"DocType '{reference_doctype}' does not exist."}

		# Get the meta for this doctype to validate fields
		meta = frappe.get_meta(reference_doctype)
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
			warning = f"Fields {', '.join(invalid_fields)} do not exist in DocType '{reference_doctype}' and were ignored."

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
				filter_warning = f"Filter fields {', '.join(invalid_filter_fields)} do not exist in DocType '{reference_doctype}' and were ignored."
				warning = f"{warning}\n{filter_warning}" if warning else filter_warning

		# Get list of documents with validated fields
		result = frappe.get_all(
			reference_doctype,
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
		# Return error in result format
		return {"success": False, "error": str(e)}


def handle_update_document(document_id=None, data=None, reference_doctype=None, **kwargs):
	"""
	Update a document

	Args:
	    document_id (str): ID of the document to update
	    data (dict): Fields to update
	    reference_doctype (str): DocType of the document (provided by function configuration)
	    **kwargs: Additional parameters from function schema

	Returns:
	    dict: Updated document data
	"""

	# Handle different parameter formats
	# If data is not provided, build it from kwargs
	if data is None:
		data = {}
		# Extract update fields from kwargs
		for key, value in kwargs.items():
			if key not in ["document_id", "item_code", "reference_doctype"]:
				data[key] = value

	# Try to get document_id from different sources
	if not document_id:
		# Check if item_code was provided
		if "item_code" in kwargs:
			document_id = kwargs["item_code"]
		elif "item_name" in kwargs:
			document_id = kwargs["item_name"]

	try:
		# Get the reference doctype from function configuration
		if not reference_doctype:
			# Try to get from context
			reference_doctype = frappe.flags.get("current_function_doctype")

		if not reference_doctype:
			return {
				"success": False,
				"error": "No reference doctype provided. Please specify a valid DocType.",
			}

		# Validate the doctype exists
		if not frappe.db.exists("DocType", reference_doctype):
			return {"success": False, "error": f"DocType '{reference_doctype}' does not exist."}

		# Validate document exists
		if not frappe.db.exists(reference_doctype, document_id):
			return {
				"success": False,
				"error": f"Document '{document_id}' not found in DocType '{reference_doctype}'.",
			}

		try:
			# Get document
			doc = frappe.get_doc(reference_doctype, document_id)

			# Update fields
			for field, value in data.items():
				if hasattr(doc, field):
					setattr(doc, field, value)

			# Save document
			doc.save()

			# Ensure datetime objects are converted to strings
			import datetime

			doc_dict = doc.as_dict()
			for key, value in doc_dict.items():
				if isinstance(value, (datetime.datetime, datetime.date, datetime.time)):
					doc_dict[key] = str(value)

			return {
				"success": True,
				"result": doc_dict,
				"message": f"Document '{document_id}' updated successfully.",
			}

		except frappe.DoesNotExistError:
			return {
				"success": False,
				"error": f"Document '{document_id}' not found in DocType '{reference_doctype}'.",
			}

	except Exception as e:
		# Return error in result format
		return {"success": False, "error": str(e)}


def handle_create_document(data=None, reference_doctype=None, **kwargs):
	"""
	Create a new document

	Args:
	    data (dict): Document data
	    reference_doctype (str): DocType of the document (provided by function configuration)
	    **kwargs: Additional parameters from function schema

	Returns:
	    dict: Created document data
	"""

	# Handle different parameter formats
	if data is None:
		data = {}
		# Extract fields from kwargs
		for key, value in kwargs.items():
			if key not in ["reference_doctype"]:
				data[key] = value

	try:
		# Get the reference doctype from function configuration
		if not reference_doctype:
			# Try to get from context
			reference_doctype = frappe.flags.get("current_function_doctype")

		if not reference_doctype:
			return {
				"success": False,
				"error": "No reference doctype provided. Please specify a valid DocType.",
			}

		# Validate the doctype exists
		if not frappe.db.exists("DocType", reference_doctype):
			return {"success": False, "error": f"DocType '{reference_doctype}' does not exist."}

		try:
			# Use the existing create_document function from functions.py
			from raven.ai.functions import create_document as create_doc_func

			# Get the bot function configuration if available
			function = None
			# The function parameter is not passed here, so we'll just pass None

			result = create_doc_func(reference_doctype, data, function)

			return {"success": True, "result": result}

		except frappe.exceptions.ValidationError as ve:
			return {
				"success": False,
				"error": f"Validation error: {str(ve)}",
			}

	except Exception as e:
		# Return error in result format
		return {"success": False, "error": str(e)}


def handle_delete_document(document_id, reference_doctype=None):
	"""
	Delete a document

	Args:
	    document_id (str): ID of the document to delete
	    reference_doctype (str): DocType of the document (provided by function configuration)

	Returns:
	    dict: Deletion result
	"""

	try:
		# Get the reference doctype from function configuration
		if not reference_doctype:
			# Try to get from context
			reference_doctype = frappe.flags.get("current_function_doctype")

		if not reference_doctype:
			return {
				"success": False,
				"error": "No reference doctype provided. Please specify a valid DocType.",
			}

		# Validate the doctype exists
		if not frappe.db.exists("DocType", reference_doctype):
			return {"success": False, "error": f"DocType '{reference_doctype}' does not exist."}

		# Validate document exists
		if not frappe.db.exists(reference_doctype, document_id):
			return {
				"success": False,
				"error": f"Document '{document_id}' not found in DocType '{reference_doctype}'.",
			}

		try:
			# Delete document
			frappe.delete_doc(reference_doctype, document_id)

			return {
				"success": True,
				"message": f"Document '{document_id}' deleted successfully from {reference_doctype}.",
			}

		except frappe.DoesNotExistError:
			return {
				"success": False,
				"error": f"Document '{document_id}' not found in DocType '{reference_doctype}'.",
			}

	except Exception as e:
		# Return error in result format
		return {"success": False, "error": str(e)}


def handle_get_document(document_id, reference_doctype=None):
	"""
	Get a document by ID

	Args:
	    document_id (str): ID of the document to retrieve
	    reference_doctype (str): DocType of the document (provided by function configuration)

	Returns:
	    dict: Document data
	"""

	try:
		# Get the reference doctype from function configuration
		if not reference_doctype:
			# Try to get from context
			reference_doctype = frappe.flags.get("current_function_doctype")

		if not reference_doctype:
			return {
				"success": False,
				"error": "No reference doctype provided. Please specify a valid DocType.",
			}

		# Validate the doctype exists
		if not frappe.db.exists("DocType", reference_doctype):
			return {"success": False, "error": f"DocType '{reference_doctype}' does not exist."}

		# Validate document exists
		if not frappe.db.exists(reference_doctype, document_id):
			return {
				"success": False,
				"error": f"Document '{document_id}' not found in DocType '{reference_doctype}'.",
			}

		try:
			# Get document
			doc = frappe.get_doc(reference_doctype, document_id)
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
			meta = frappe.get_meta(reference_doctype)
			valid_fields = ["name", "creation", "modified", "modified_by", "owner", "docstatus"]
			for df in meta.fields:
				valid_fields.append(df.fieldname)

			return {
				"success": True,
				"result": doc_dict,
				"valid_fields": valid_fields[:20],  # Show first 20 fields
			}
		except frappe.DoesNotExistError:
			return {
				"success": False,
				"error": f"Document '{document_id}' not found in DocType '{reference_doctype}'.",
			}

	except Exception as e:
		# Return error in result format
		return {"success": False, "error": str(e)}


def handle_generic_function(**kwargs):
	"""
	Generic handler that adapts parameters and calls the appropriate function from raven.ai.functions

	This handler is used for functions that don't need special parameter adaptation
	"""
	try:
		# Get the actual function name from extra_args
		actual_function = kwargs.pop("actual_function", None)
		reference_doctype = kwargs.pop("reference_doctype", None)

		if not actual_function:
			return {"success": False, "error": "No function specified"}

		# Get the reference doctype from context if not provided
		if not reference_doctype:
			reference_doctype = frappe.flags.get("current_function_doctype")

		if not reference_doctype:
			return {"success": False, "error": "No reference doctype provided."}

		# Import the functions module
		from raven.ai import functions

		# Get the actual function
		func = getattr(functions, actual_function, None)
		if not func:
			return {"success": False, "error": f"Function {actual_function} not found"}

		# Call the function with doctype as first parameter
		# The kwargs will contain the other parameters from the SDK
		result = func(reference_doctype, **kwargs)

		# Wrap the result in success format
		if isinstance(result, dict) and "error" in result:
			return {"success": False, "error": result["error"]}
		else:
			return {"success": True, "result": result}

	except Exception as e:
		# Return error in result format
		return {"success": False, "error": str(e)}
