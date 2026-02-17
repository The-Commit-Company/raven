import frappe
from frappe.frappeclient import FrappeClient
from frappe import _
import base64
import os
from raven.raven_cloud_notifications import get_site_name
from frappe.utils.user import get_user_fullname
from frappe.utils import get_system_timezone


@frappe.whitelist()
def download_marketplace(
    marketplace_name:str,
):
    '''
        Download the Marketplace, IT can have Bot, Document Notification or Schedule Messages.
        :param marketplace_name: Name of the marketplace from which the marketplace is to be downloaded

        Steps:
        1. Make Connection with the site using FrappeClient by Getting the site URL and API Key from Raven Settings
           a. If the site is not connected then raise an error
           b. If the site is connected then check if the marketplace_name is valid and exists in the marketplace
        2. Check if User have Roles as "Raven Admin" or "System Manager"
        3. If It is AI Bot Check then in Raven Settings enable_ai_integration is True, and marketplace is published
        4. Then Check if linked_apps is installed in the site
        5. Check the type of marketplace, if it is Bot then check if AI Bot is enabled in Raven Settings
            a. If all checks are passed then download the bot from marketplace
            b. Firstly Create a Document for Raven Bot
            c. Set the necessary fields for the Raven Bot Document
            d. Check if Original Document Have Image Field then Create Image File in Respective Site and set the image field in the Raven Bot Document
            e. Check if bot_functions exist , go through each function and check if already exists in the site, if exist then Just update the function name by adding "_for_{bot_name}" to the function name end
            f. If Function name Need's to replace then check in instructions Text if it contains the function name, if it does then replace the function name with the new function name
            g. Check if file_sources exist, if exist then create a file in the site and set the file field in the Raven Bot Document
        6. Create a Log for the downloaded bot in the Connected Site
        7. If all steps are successful then return the success message with the marketplace name
    '''

    # 1. Check if User have Roles as "Raven Admin" or "System Manager"
    roles = frappe.get_roles()
    if not any(role in roles for role in ["Raven Admin", "System Manager"]):
        frappe.throw(_("You do not have permission to download the marketplace. Please contact your administrator."))

    # 2. Check if Raven Settings is configured for Marketplace
    raven_settings = frappe.get_single("Raven Settings")

    if not raven_settings.push_notification_service == "Raven":
        frappe.throw(_("Raven Settings is not configured to use Raven Cloud for Marketplace."))

    if not raven_settings.push_notification_server_url or not raven_settings.push_notification_api_key or not raven_settings.push_notification_api_secret:
        frappe.throw(_("Raven Settings is not configured with the Raven Cloud URL, API Key, and API Secret."))

    # 3. Make Connection with the site using FrappeClient
    conn = FrappeClient(
        url=raven_settings.push_notification_server_url,
		api_key=raven_settings.push_notification_api_key,
		api_secret=raven_settings.get_password("push_notification_api_secret"),
    )

    # Get the marketplace data
    marketplace = conn.get_api("raven_cloud.raven_cloud.doctype.raven_marketplace.raven_marketplace.get_marketplace",{
        "marketplace_id": marketplace_name,
        "site_name": get_site_name(),
    })

    if not marketplace:
        frappe.throw(_("Marketplace {0} does not exist.".format(marketplace_name)))

    if not marketplace.get("status") == "Published":
        frappe.throw(_("Marketplace {0} is not published, you cannot download it.".format(marketplace_name)))

    # 4. Check if linked_apps are installed in the site
    check_linked_apps_installed(marketplace)

    # Create th Log for the downloaded bot
    log_doc = conn.insert({
        "doctype":"Marketplace Download Logs",
        "marketplace_name": marketplace.get("name"),
        "status":"Pending",
        "site_name": get_site_name(),
        "requested_by_user": frappe.session.user,
        "requested_by_user_name": get_user_fullname(frappe.session.user),
        "timezone": get_system_timezone(),
        "downloaded_at": frappe.utils.now(),
    })

    try:
        # 5. Create raven bot if marketplace_type is Bot
        if marketplace.get("marketplace_type") == "Bot":

            is_ai_bot = marketplace.get("is_ai_bot", False)
            # Check if AI Bot is enabled in Raven Settings
            if is_ai_bot and not raven_settings.enable_ai_integration:
                frappe.throw(_("AI Integration is not enabled in Raven Settings, please enable it to download AI Bots."))

            create_raven_bot_document(marketplace,conn)

        frappe.db.commit()

        # update the log status to "Success"
        conn.update({
            "doctype": "Marketplace Download Logs",
            **log_doc,
            "status": "Success",
        })

        return "Marketplace downloaded successfully: {0}".format(marketplace_name)
    
    except Exception as e:
        # If any error occurs, update the log status to "Failed"
        conn.update({
            "doctype": "Marketplace Download Logs",
            **log_doc,
            "status": "Failed",
        })

        # throw the error to be handled by the caller
        frappe.throw(_("Failed to download marketplace {0}: {1}".format(marketplace_name, str(e))))


def check_linked_apps_installed(marketplace):
    '''
        Check if all linked apps are installed in the site with required minimum version
    '''

    linked_apps = marketplace.get("linked_apps", [])
    installed_apps = frappe.get_single("Installed Applications").as_dict().installed_applications
    
    # Create a mapping of installed app names to their versions for quick lookup
    installed_apps_map = {app.get("app_name"): app.get("app_version") for app in installed_apps}
    
    for app in linked_apps:
        app_name = app.get("app_name")
        min_version_required = app.get("min_version_required")
        
        # Check if app is installed
        if app_name not in installed_apps_map:
            frappe.throw(_("Linked app {0} is not installed.".format(app_name)))
        
        # Check if installed version meets minimum requirement
        installed_version = installed_apps_map[app_name]
        if min_version_required and installed_version:
            # Compare versions (assuming semantic versioning)
            if not is_version_compatible(installed_version, min_version_required):
                frappe.throw(_("Linked app {0} requires minimum version {1}, but version {2} is installed.".format(
                    app_name, min_version_required, installed_version
                )))
        

def create_raven_bot_document(marketplace,conn):
    '''
        Create a Raven Bot Document from the marketplace data
    '''
    if frappe.db.exists("Raven Bot", marketplace.get("product_name")):
        frappe.throw(_("Raven Bot {0} already exists.".format(marketplace.get("product_name"))))

    # JSON of all Raven Bot, Raven Bot Functions and Raven AI Bot Files
    bot_data = frappe.parse_json(marketplace.get("bot_data", {}))

    bot_doc = bot_data.get("doc", {})
    bot_functions = bot_doc.get("bot_functions", [])
    file_sources = bot_doc.get("file_sources", [])

    instruction = bot_doc.get("instruction", "")
    function_name_change_map = {}

    for func in bot_functions:
        new_function_name = func.get("function")
        if frappe.db.exists("Raven AI Function", new_function_name):
            # If function already exists, append bot name to the function name
            new_function_name = f"{new_function_name}_for_{bot_doc.get('bot_name')}"
            function_name_change_map[func.get("function")] = new_function_name
        
        function_data = func.get("function_data", {})
        # Create the Raven AI Function Document
        function_doc = frappe.get_doc({
            "doctype": "Raven AI Function",
            **function_data,
            "name": new_function_name,
            "function_name": new_function_name,
        })

        function_doc.insert()

        func["function"] = new_function_name

        func.pop("function_data", None)

    # Replace function names in instructions
    if function_name_change_map:
        for old_name, new_name in function_name_change_map.items():
            instruction = instruction.replace(old_name, new_name)


    for source in file_sources:
        function_data = source.get("function_data", {})
        file = function_data.get("file")

        new_file = download_and_store_file(conn, file, attached_to_doctype="Raven AI File Source", attached_to_name='new-raven-ai-file-source', attached_to_field="file")

        new_source = frappe.get_doc({
            "doctype": "Raven AI File Source",
            "file": new_file.get("file_url"),
        })
        new_source.insert()

        source["file"] = new_source.name

        # pop the function_data as it is not needed in the final document
        source.pop("function_data", None)

    image = ""
    bot_image = bot_doc.get("image", "")
    if bot_image:
        # Create the image file in the site

        new_image = download_and_store_file(conn, bot_image, attached_to_doctype="Raven Bot", attached_to_name=bot_doc.get("bot_name"), attached_to_field="image")
        # Set the image field in the Raven Bot Document
        image = new_image.file_url

    # Create the Raven Bot Document
    raven_bot_doc = frappe.get_doc({
        "doctype": "Raven Bot",
        **bot_doc,
        "instruction": instruction,
        "bot_functions": bot_functions,
        "file_sources": file_sources,
        "image": image,
        "marketplace_id": marketplace.get("name"),
        "mapped_functions": function_name_change_map
    })

    raven_bot_doc.insert()


def download_and_store_file(conn, file_url, attached_to_doctype=None, attached_to_name=None, attached_to_field=None):
    """
        Download a file from remote Frappe site and store it in current site.
        :param conn: Authenticated FrappeClient
        :param file_url: File path on remote site (e.g., '/private/files/sample.pdf')
        :param attached_to_doctype: Doctype to attach the file (optional)
        :param attached_to_name: Docname to attach the file (optional)
        :return: File document created in current site
    """

    raven_settings = frappe.get_single("Raven Settings")
    # Step 1: Remote file download
    response = conn.session.get(
        conn.url + "/api/method/frappe.handler.download_file",
        params={"file_url": file_url},
        stream=True,
        headers={
            "Authorization": f"token {raven_settings.push_notification_api_key}:{raven_settings.get_password('push_notification_api_secret')}"
        }
    )

    if response.status_code != 200:
        frappe.throw(f"Failed to download file from remote site: {response.text}")

    file_content = response.content
    file_name = os.path.basename(file_url)

    # Step 2: Create local File Doc
    new_file = frappe.get_doc({
        "doctype": "File",
        "content": base64.b64encode(file_content).decode(),
        "file_name": file_name,
        "decode": True,
        "is_private": 1,
        "attached_to_doctype": attached_to_doctype,
        "attached_to_name": attached_to_name,
        "attached_to_field": attached_to_field,
    })
    new_file.insert(ignore_permissions=True)

    return new_file


def is_version_compatible(installed_version, min_version_required):
    """
        Check if installed version meets the minimum version requirement.
        Assumes semantic versioning (major.minor.patch)
        
        :param installed_version: Currently installed version (e.g., "1.2.3")
        :param min_version_required: Minimum required version (e.g., "1.1.0")
        :return: True if installed version >= min version, False otherwise
    """
    try:
        # Split version strings and convert to integers for comparison
        installed_parts = [int(x) for x in installed_version.split('.')]
        required_parts = [int(x) for x in min_version_required.split('.')]
        
        # Pad shorter version with zeros
        max_length = max(len(installed_parts), len(required_parts))
        installed_parts.extend([0] * (max_length - len(installed_parts)))
        required_parts.extend([0] * (max_length - len(required_parts)))
        
        # Compare versions part by part
        for i in range(max_length):
            if installed_parts[i] > required_parts[i]:
                return True
            elif installed_parts[i] < required_parts[i]:
                return False
        
        # Versions are equal
        return True
    except (ValueError, AttributeError):
        # If version parsing fails, assume compatibility for safety
        return True