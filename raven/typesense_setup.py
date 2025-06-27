import typesense
import frappe
from frappe import _

def create_typesense_search_key():
    client = get_typesense_client(admin=True)
    search_key = client.keys.create({
        "description": "Search key.",
        "actions": ["documents:search"],
        "collections": ["*"],
        "autodelete": True,
    })
    frappe.db.set_single_value("Raven Settings", "typesense_search_api_key", search_key["value"])
    frappe.db.commit()

def get_typesense_client(admin=False, user=None):

    raven_settings = frappe.get_cached_doc("Raven Settings")

    if not raven_settings.enable_typesense:
        frappe.throw(_("Typesense is not enabled"))

    typesense_host = raven_settings.typesense_host
    typesense_port = raven_settings.typesense_port
    if admin:
        typesense_api_key = raven_settings.get_password("typesense_admin_api_key")
    else:
        if user:
            raven_user = frappe.get_cached_doc("Raven User", user)
            if raven_user.typesense_search_api_key:
                typesense_api_key = raven_user.get_password("typesense_search_api_key")
            else:
                typesense_api_key = create_scoped_key(user)
        else:
            typesense_api_key = raven_settings.get_password("typesense_search_api_key")
    typesense_connection_timeout_seconds = raven_settings.typesense_connection_timeout_seconds
    typesense_protocol = raven_settings.typesense_protocol

    if not all([typesense_host, typesense_port, typesense_api_key, typesense_protocol]):
        missing_fields = []
        if not typesense_host:
            missing_fields.append("Typesense Host")
        if not typesense_port:
            missing_fields.append("Typesense Port")
        if not typesense_api_key:
            missing_fields.append("Typesense API Key")
        if not typesense_protocol:
            missing_fields.append("Typesense Protocol")

        frappe.throw(_("Please configure the following Typesense settings: {0}").format(", ".join(missing_fields)))

    client = typesense.Client({
        'nodes': [{
            'host': typesense_host,
            'port': typesense_port,
            'protocol': typesense_protocol,
        }],
        'api_key': typesense_api_key,
        'connection_timeout_seconds': typesense_connection_timeout_seconds,
    })

    return client

def setup_typesense():    
    raven_message = {
        'name': 'messages',
        'fields': [
            {
                'name': 'id',
                'type': 'string',
            },
            {
                'name': 'channel_id',
                'type': 'string',
                'facet': True,
            },
            {
                'name': 'content',
                'type': 'string',
            },
            {
                'name': 'message_type',
                'type': 'string',
            },
            {
                'name': 'accessible_to',
                'type': 'string[]'
            }
        ]
    }

    raven_channel = {
        'name': 'channels',
        'fields': [
            {
                'name': 'id',
                'type': 'string',
            },
            {
                'name': 'channel_name',
                'type': 'string',
            },
            {
                'name': 'channel_description',
                'type': 'string',
            },
            {
                'name': 'type',
                'type': 'string',
            },
            {
                'name': 'workspace',
                'type': 'string',
            },
            {
                'name': 'accessible_to',
                'type': 'string[]'
            }
        ]
    }

    raven_user = {
        'name': 'users',
        'fields': [
            {
                'name': 'id',
                'type': 'string',
            },
            {
                'name': 'full_name',
                'type': 'string',
            },
            {
                'name': 'type',
                'type': 'string',
            },
            {
                'name': 'accessible_to',
                'type': 'string[]'
            }
        ]
    }
    if not frappe.db.get_single_value("Raven Settings", "typesense_search_api_key"):
        create_typesense_search_key()

    client = get_typesense_client(admin=True)

    # Create collections if they don't exist
    try:
        client.collections['messages'].retrieve()
    except typesense.exceptions.ObjectNotFound:
        client.collections.create(raven_message)
    client.collections['messages'].documents.import_(get_messages(), {"action": "upsert"})

    try:
        client.collections['channels'].retrieve()
    except typesense.exceptions.ObjectNotFound:
        client.collections.create(raven_channel)
    client.collections['channels'].documents.import_(get_channels(), {"action": "upsert"})

    try:
        client.collections['users'].retrieve()
    except typesense.exceptions.ObjectNotFound:
        client.collections.create(raven_user)
    client.collections['users'].documents.import_(get_raven_users(), {"action": "upsert"})

    return "Success"

def _get_channel_permissions(channel_ids):
    """Helper function to compute channel permissions for a list of channel IDs"""
    raven_users = frappe.get_all("Raven User", 
        fields=["user"], 
        filters={"enabled": 1, "type": "User"}
    )

    user_list = [user.user for user in raven_users]
    channel_permissions = {}

    for channel_id in channel_ids:
        channel_permissions[channel_id] = [
            user_id
            for user_id in user_list
            if frappe.has_permission(
                doctype="Raven Channel", 
                doc=channel_id, 
                ptype="read", 
                user=user_id
            )
        ]

    return channel_permissions

def get_messages():
    messages = frappe.get_all("Raven Message", fields=["name", "channel_id", "content", "message_type"])

    # Get all unique channel IDs from messages
    channel_ids = set(msg.channel_id for msg in messages)
    channel_permissions = _get_channel_permissions(channel_ids)

    result = []
    for message in messages:
        result.append({
            "id": message.name,
            "channel_id": message.channel_id,
            "content": message.content or "",
            "message_type": message.message_type,
            "accessible_to": channel_permissions[message.channel_id]
        })

    return result

def get_channels():
    channels = frappe.get_all("Raven Channel", fields=["name", "channel_name", "channel_description", "type", "workspace"], filters={"is_direct_message": 0, "is_thread": 0})

    # Get all channel IDs
    channel_ids = [channel.name for channel in channels]
    channel_permissions = _get_channel_permissions(channel_ids)

    result = []
    for channel in channels:
        result.append({
            "id": channel.name,
            "channel_name": channel.channel_name,
            "channel_description": channel.channel_description or "",
            "type": channel.type,
            "workspace": channel.workspace or "",
            "accessible_to": channel_permissions[channel.name]
        })

    return result

def get_raven_users():
    users = frappe.get_all("Raven User", fields=["name", "full_name", "type"])

    all_user_ids = [user.name for user in users]

    result = []
    for user in users:
        result.append({
            "id": user.name,
            "full_name": user.full_name,
            "type": user.type,
            "accessible_to": all_user_ids
        })

    return result

def get_search_key():
    raven_settings = frappe.get_cached_doc("Raven Settings")
    typesense_api_key = raven_settings.get_password("typesense_search_api_key")
    return typesense_api_key

def create_scoped_key(user_id):
    client = get_typesense_client(admin=True)
    search_key = get_search_key()
    scoped_key = client.keys.generate_scoped_search_key(search_key, {"filter_by": f"accessible_to:={user_id}", "autodelete": True, "expires_at": 1906054106})
    if isinstance(scoped_key, bytes):
        scoped_key = scoped_key.decode('utf-8')
        frappe.db.set_value("Raven User", user_id, "typesense_search_api_key", scoped_key)
        frappe.db.commit()
    return scoped_key