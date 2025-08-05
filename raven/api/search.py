import frappe
from pypika import JoinType
from frappe.search.sqlite_search import SQLiteSearch
from raven.api.raven_channel import get_channel_list
class RavenSearch(SQLiteSearch):
    # Database file name
    INDEX_NAME = "raven_search.db"

    # Define the search schema
    INDEX_SCHEMA = {
        "text_fields": ["content"],
        "metadata_fields": ["channel_id", "owner", "creation"],
        "tokenizer": "unicode61 remove_diacritics 2 tokenchars '-_'",
    }

    # Define which doctypes to index and their field mappings
    INDEXABLE_DOCTYPES = {
        "Raven Message": {
            "fields": ["name", "content", "channel_id", "owner", "creation"],
        },
    }

    def get_search_filters(self):
        """Return permission filters for current user"""
        # Get channels accessible to current user
        channel_list = get_channel_list(hide_archived=False)
        channel_list = [channel.get("name") for channel in channel_list]

        if not channel_list:
            return {"channel_id": []}  # No access

        return {"channel_id": channel_list}

@frappe.whitelist()
def sqlite_search(query, filters=None):
    search = RavenSearch()
    result = search.search(query, filters=filters)

    return result

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