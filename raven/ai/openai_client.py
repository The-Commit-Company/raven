import frappe
from frappe import _
from openai import OpenAI
import requests
import json


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

@frappe.whitelist()
def get_openai_models():
    """
    Get the list of OpenAI models available for assistants
    """
    try:
        client = get_open_ai_client()
        models = client.models.list()
        
        # Filter only the models compatible with assistants
        assistant_compatible_models = []
        for model in models.data:
            model_id = model.id.lower()
            # Filter only the gpt models
            if any(prefix in model_id for prefix in ["gpt-4", "gpt-3.5"]):
                assistant_compatible_models.append({
                    "id": model.id,
                    "created": model.created,
                    "owned_by": model.owned_by
                })
        
        return assistant_compatible_models
    except Exception as e:
        frappe.log_error(f"Error fetching OpenAI models: {str(e)}")
        # Return a default list in case of error
        return []

@frappe.whitelist()
def create_and_register_openai_project(project_name, description=None, api_key=None, organization_id=None, enable_ai_integration=True):
    """
    Creates an OpenAI project via the API and registers it in Raven settings.
    
    Args:
        project_name (str): Name of the project to create
        description (str, optional): Project description
        api_key (str, optional): OpenAI API key. If not provided, uses the one from Raven settings.
        organization_id (str, optional): OpenAI organization ID. If not provided, uses the one from Raven settings.
        enable_ai_integration (bool, optional): Whether AI integration is enabled. If not provided, uses the value from Raven settings.
        
    Returns:
        dict: Information about the created project
    """
    raven_settings = frappe.get_cached_doc("Raven Settings")
    
	# Enable AI integration in Raven Settings
    raven_settings.enable_ai_integration = enable_ai_integration	
    
    # Retrieve or verify the API key
    if not api_key:
        api_key = raven_settings.get_password("openai_api_key")
        if not api_key:
            frappe.throw(_("OpenAI API key is not configured in Raven Settings"))
    if not organization_id:
        organization_id = raven_settings.openai_organisation_id
        if not organization_id:
            frappe.throw(_("OpenAI organization ID is not configured in Raven Settings"))
    
    # Creation of the project via the OpenAI API
    project_payload = {
        "name": project_name
    }
    if description:
        project_payload["description"] = description
    

    project_result = make_openai_api_request(
        "organization/projects", 
        method="POST", 
        payload=project_payload,
        api_key=api_key,
        organization_id=organization_id
    )
    
    project_id = project_result.get("id")
    
    # Creation of a service account to obtain a project-specific API key
    service_account_payload = {
        "name": f"Service Account for {project_name}"
    }
    
    sa_result = make_openai_api_request(
        f"organization/projects/{project_id}/service_accounts",
        method="POST",
        payload=service_account_payload,
        api_key=api_key,
        organization_id=organization_id
    )
    
    new_api_key = sa_result.get("api_key", {}).get("value")
    if not new_api_key:
        frappe.throw(_("Error: The creation of the service account did not return a valid API key"))
    
    # Update Raven Settings with the project_id and the new API key
    raven_settings.enable_ai_integration = enable_ai_integration
    raven_settings.openai_project_id = project_id
    raven_settings.openai_organisation_id = organization_id
    raven_settings.openai_api_key = new_api_key  # The new API key of the service account
    raven_settings.save()
        
    return {
        "project_id": project_id,
        "project_name": project_name,
        "organization_id": organization_id,
        "openai_api_key": new_api_key,
        "enable_ai_integration": enable_ai_integration,
        "success": True,
        "message": f"OpenAI project '{project_name}' created with ID: {project_id} and a generated API key."
    }

@frappe.whitelist()
def make_openai_api_request(endpoint, method="GET", payload=None, api_key=None, organization_id=None):
    """
    Makes a call to the OpenAI API with the specified parameters.
    
    Args:
        endpoint (str): The API endpoint to call (without the base URL prefix)
        method (str, optional): HTTP method to use (GET, POST, PUT, DELETE). Default "GET".
        payload (dict, optional): Data to send with the request for POST, PUT methods.
        api_key (str, optional): OpenAI API key. If not provided, uses the one from Raven settings.
        organization_id (str, optional): OpenAI organization ID. If not provided, uses the one from Raven settings.
        
    Returns:
        dict: OpenAI API response
    """
    raven_settings = frappe.get_cached_doc("Raven Settings")
    
    # Retrieve or verify the API key
    if not api_key:
        api_key = raven_settings.get_password("openai_api_key")
        if not api_key:
            frappe.throw(_("OpenAI API key is not configured in Raven Settings"))
    
    # Retrieve or verify the organization ID
    if not organization_id:
        organization_id = raven_settings.openai_organisation_id
        if not organization_id:
            frappe.throw(_("OpenAI organization ID is not configured in Raven Settings"))
    
    # Preparation of headers, including the organization ID
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "OpenAI-Organization": organization_id
    }
    
    # Construction of the complete URL
    base_url = "https://api.openai.com/v1"
    if not endpoint.startswith('/'):
        endpoint = '/' + endpoint
    full_url = f"{base_url}{endpoint}"
    
    # Execution of the request according to the specified method
    try:
        if method.upper() == "GET":
            response = requests.get(full_url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(full_url, headers=headers, data=json.dumps(payload or {}))
        elif method.upper() == "PUT":
            response = requests.put(full_url, headers=headers, data=json.dumps(payload or {}))
        elif method.upper() == "DELETE":
            response = requests.delete(full_url, headers=headers)
        else:
            frappe.throw(_("Unsupported HTTP method: ") + method)
        
        # Verification of the status code
        if response.status_code not in (200, 201, 202, 204):
            error_message = response.json().get("error", {}).get("message", "Unknown error")
            frappe.throw(_("OpenAI API error: ") + error_message)
        
        # Return the JSON results if available, otherwise return a dictionary with the status
        try:
            return response.json()
        except ValueError:
            return {"status": "success", "status_code": response.status_code}
            
    except requests.exceptions.RequestException as e:
        frappe.throw(_("OpenAI API connection error: ") + str(e))
