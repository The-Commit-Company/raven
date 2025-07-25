import typesense
import frappe
from frappe import _

def get_typesense_client():

    raven_settings = frappe.get_cached_doc("Raven Settings")

    if not raven_settings.enable_typesense:
        frappe.throw(_("Typesense is not enabled"))

    typesense_host = raven_settings.typesense_host
    typesense_port = raven_settings.typesense_port
    typesense_api_key = raven_settings.get_password("typesense_api_key")
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

def sync_typesense():    
    client = get_typesense_client()
    raven_settings = frappe.get_cached_doc("Raven Settings")
    typesense_hash = raven_settings.typesense_hash

    # Messages query
    message = frappe.qb.DocType("Raven Message")
    mention = frappe.qb.DocType("Raven Mention")

    query = (
        frappe.qb.from_(message)
        .select(
            message.name.as_("id"),
            message.channel_id,
            message.content,
            message.message_type,
            message.is_thread,
            message.is_bot_message,
            message.bot,
            message.owner,
            message.creation,
            mention.user.as_("mention_user")
        )
        .left_join(mention)
        .on(mention.parent == message.name)
    )

    results = query.run(as_dict=True)

    messages_dict = {}
    for row in results:
        message_id = row["id"]
        if message_id not in messages_dict:
            messages_dict[message_id] = {
                "id": message_id,
                "channel_id": row["channel_id"],
                "content": row["content"] or "",
                "message_type": row["message_type"],
                "is_thread": row["is_thread"],
                "is_bot_message": row["is_bot_message"],
                "bot": row["bot"] or "",
                "owner": row["owner"],
                "creation": str(row["creation"]) if row["creation"] else "",
                "mentions": []
            }

        # Add mention to message
        if row["mention_user"]:
            messages_dict[message_id]["mentions"].append(row["mention_user"])

    messages = list(messages_dict.values())

    try:
        response = client.collections[f'{typesense_hash}_messages'].documents.import_(messages, {"action": "upsert"})
    except Exception as e:
        frappe.log_error(f"Error syncing Typesense: {e}")
        frappe.throw(_("Error syncing Typesense: {0}").format(e))
    return response
