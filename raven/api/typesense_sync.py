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
    frappe.publish_progress(0, title="Typesense Sync", description="Initializing...", task_id="typesense_sync_progress")

    client = get_typesense_client()
    raven_settings = frappe.get_cached_doc("Raven Settings")
    typesense_hash = raven_settings.typesense_hash

    # Messages query
    message = frappe.qb.DocType("Raven Message")
    mention = frappe.qb.DocType("Raven Mention")
    channel = frappe.qb.DocType("Raven Channel")
    thread_message = frappe.qb.DocType("Raven Message").as_("thread_message")
    file = frappe.qb.DocType("File")

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
            mention.user.as_("mention_user"),
            channel.is_thread.as_("channel_is_thread"),
            thread_message.channel_id.as_("parent_channel_id"),
            file.file_type
        )
        .left_join(mention)
        .on(mention.parent == message.name)
        .left_join(channel)
        .on(channel.name == message.channel_id)
        .left_join(thread_message)
        .on((thread_message.name == message.channel_id) & (channel.is_thread == 1))
        .left_join(file)
        .on((file.attached_to_name == message.name) & (message.message_type == "File"))
        .where(message.message_type != "System")
    )

    frappe.publish_progress(25, description="Querying database...", task_id="typesense_sync_progress")

    results = query.run(as_dict=True)

    messages_dict = {}
    total_rows = len(results)

    for i, row in enumerate(results):
        message_id = row["id"]
        if message_id not in messages_dict:

            if row["channel_is_thread"]:
                parent_channel_id = row["parent_channel_id"]
            else:
                parent_channel_id = row["channel_id"]

            file_type = row["file_type"] if row["message_type"] == "File" else None

            messages_dict[message_id] = {
                "id": message_id,
                "parent_channel_id": parent_channel_id,
                "channel_id": row["channel_id"],
                "content": row["content"] or "",
                "message_type": row["message_type"],
                "file_type": file_type,
                "is_thread": row["is_thread"],
                "is_bot_message": row["is_bot_message"],
                "bot": row["bot"],
                "owner": row["owner"],
                "creation": str(row["creation"]) if row["creation"] else "",
                "mentions": [],
            }

        # Add mention to message
        if row["mention_user"]:
            messages_dict[message_id]["mentions"].append(row["mention_user"])

        # Update progress every 1000 rows to avoid spam
        if i % 1000 == 0 and total_rows > 0:
            progress = 50 + int((i / total_rows) * 25)  # 50-75% range
            frappe.publish_progress(progress, description=f"Processed {i}/{total_rows} rows", task_id="typesense_sync_progress")

    messages = list(messages_dict.values())

    frappe.publish_progress(75, description=f"Syncing {len(messages)} messages to Typesense...", task_id="typesense_sync_progress")

    try:
        response = client.collections[f'{typesense_hash}_messages'].documents.import_(messages, {"action": "upsert"})

        frappe.publish_progress(100, description="Sync completed successfully", task_id="typesense_sync_progress")
        return response
    except Exception as e:
        frappe.log_error(f"Error syncing Typesense: {e}")
        frappe.throw(_("Error syncing Typesense: {0}").format(e))
