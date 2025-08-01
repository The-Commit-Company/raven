import frappe
import json
from pypika import JoinType
from raven.api.raven_channel import get_channel_list
from raven.api.typesense_sync import get_typesense_client


@frappe.whitelist()
def get_search_result(
	filter_type,
	search_text=None,
	from_user=None,
	in_channel=None,
	saved=False,
	date=None,
	file_type=None,
	message_type=None,
	channel_type=None,
	my_channel_only=False,
):
	# Define the necessary document types
	channel_member = frappe.qb.DocType("Raven Channel Member")
	channel = frappe.qb.DocType("Raven Channel")
	message = frappe.qb.DocType("Raven Message")
	file_doc = frappe.qb.DocType("File")

	# File extension mappings
	file_extensions = {
		"pdf": "pdf",
		"doc": ["doc", "docx", "odt", "ott", "rtf", "txt", "dot", "dotx", "docm", "dotm", "pages"],
		"ppt": [
			"ppt",
			"pptx",
			"odp",
			"otp",
			"pps",
			"ppsx",
			"pot",
			"potx",
			"pptm",
			"ppsm",
			"potm",
			"ppam",
			"ppa",
			"key",
		],
		"xls": [
			"xls",
			"xlsx",
			"csv",
			"ods",
			"ots",
			"xlsb",
			"xlsm",
			"xlt",
			"xltx",
			"xltm",
			"xlam",
			"xla",
			"numbers",
		],
	}

	# Base query
	query = (
		frappe.qb.from_(message)
		.select(
			message.name,
			message.file,
			message.owner,
			message.creation,
			message.message_type,
			message.channel_id,
			message.text,
			message.content,
			channel.workspace,
		)
		.join(channel, JoinType.left)
		.on(message.channel_id == channel.name)
		.join(channel_member, JoinType.left)
		.on(channel_member.channel_id == message.channel_id)
		.join(file_doc, JoinType.left)
		.on(message.name == file_doc.attached_to_name)
		.where(channel_member.user_id == frappe.session.user)
	)

	if filter_type == "File":
		query = query.where(message.message_type != "Text" or message.message_type != "Poll").distinct()

	if filter_type == "Message":
		query = query.where(message.message_type == "Text").distinct()

	if filter_type == "Channel":
		query = (
			frappe.qb.from_(channel)
			.select(
				channel.name,
				channel.owner,
				channel.creation,
				channel.type,
				channel.channel_name,
				channel.channel_description,
				channel.is_archived,
			)
			.join(channel_member, JoinType.left)
			.on(channel_member.channel_id == channel.name)
			.where(channel.is_direct_message == 0)
			# .where(doctype.is_thread == 0)
			.where((channel.type != "Private") | (channel_member.user_id == frappe.session.user))
			.distinct()
		)

	if search_text:
		if filter_type == "File":
			query = query.where(message.file.like("/private/files/%" + search_text + "%"))
		elif filter_type == "Message":
			query = query.where(message.content.like("%" + search_text + "%"))
		elif filter_type == "Channel":
			query = query.where(channel.channel_name.like("%" + search_text + "%"))

	if from_user:
		query = query.where(message.owner == from_user)

	if in_channel:
		query = query.where(message.channel_id == in_channel)

	if date:
		query = query.where(message.creation > date)

	if message_type:
		query = query.where(message.message_type == message_type)

	if filter_type == "File":
		if file_type:
			if file_type == "image":
				query = query.where(message.message_type == "Image")
			elif file_type == "pdf":
				query = query.where(file_doc.file_type == "pdf")
			else:
				# Get the list of extensions for the given file type
				extensions = file_extensions.get(file_type)
				if extensions:
					query = query.where((file_doc.file_type).isin(extensions))
		else:
			query = query.where(message.message_type.isin(["Image", "File"]))

	if channel_type:
		query = query.where(channel.type == channel_type)

	if my_channel_only == "true":
		query = query.where((channel.type == "Open") | (channel_member.user_id == frappe.session.user))

	if saved == "true":
		query = query.where(message._liked_by.like(f"%{frappe.session.user}%"))

	return query.limit(20).offset(0).run(as_dict=True)

@frappe.whitelist()
def get_typense_search_result(
    query: str,
    query_by: str,
    filter_by: str = None,
    sort_by: str = None,
    page: int = 1,
    per_page: int = 10,
    group_by: str = None,
):
    client = get_typesense_client()
    raven_settings = frappe.get_cached_doc("Raven Settings")
    typesense_hash = raven_settings.typesense_hash
    collection = f"{typesense_hash}_messages"

    channel_list = get_channel_list(hide_archived=False)
    channel_list = [channel.get("name") for channel in channel_list]

    search_params = {
        "q": query,
        "query_by": query_by,
        "enable_lazy_filter": True,
        "validate_field_names": False,
        "page": page,
        "per_page": per_page,
    }

    if not filter_by:
        search_params["filter_by"] = f"parent_channel_id:{channel_list}"

    if filter_by:
        filter_by = json.loads(filter_by)

        if filter_by.get("channel_id"):
            filtered_channel_list = [channel for channel in channel_list if channel in filter_by.get("channel_id")]
            _add_filter_condition(search_params, f"parent_channel_id:{filtered_channel_list}")

        filters = [
            "message_type", "file_type", "is_thread", 
            "is_bot_message", "bot", "owner", "creation", "mentions"
        ]

        for filter in filters:
            if filter_by.get(filter):
                _add_filter_condition(search_params, f"{filter}:{filter_by.get(filter)}")

    if sort_by:
        search_params["sort_by"] = sort_by

    if group_by:
        search_params["group_by"] = group_by

    result = client.collections[collection].documents.search(search_params)

    hits = result.get("hits")
    final_result = [hit["document"] for hit in hits]

    # also look in Raven Search Sync
    sync_queue = frappe.qb.DocType("Raven Search Sync")
    sync_queue_query = (frappe.qb.from_(sync_queue)
             .select(sync_queue.content, sync_queue.document_id)
             .where(sync_queue.action == "Upsert")
             .where(sync_queue.reference_doctype == "Raven Message"))
    sync_result = sync_queue_query.run(as_dict=True)

    for sync_hit in sync_result:
        content_data = sync_hit["content"]
        content_data = json.loads(content_data)
        if content_data.get("content") and query.lower() in content_data.get("content", "").lower():
            final_result.append({"id": sync_hit["document_id"], **content_data})

    return final_result

def _add_filter_condition(search_params, condition):
    """Append filter condition to search_params"""
    if search_params.get("filter_by"):
        search_params["filter_by"] = f"{search_params['filter_by']}&&{condition}"
    else:
        search_params["filter_by"] = condition

