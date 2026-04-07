import json
import mimetypes

import frappe
from frappe.search.sqlite_search import SQLiteSearch
from pypika import JoinType

from raven.api.document_link import get_preview_data
from raven.api.raven_channel import get_channel_list


class RavenSearch(SQLiteSearch):
	# Database file name
	INDEX_NAME = "raven_search.db"

	# Define the search schema
	INDEX_SCHEMA = {
		"text_fields": ["title", "content"],
		"metadata_fields": [
			"channel_id",
			"owner",
			"creation",
			"parent_channel_id",
			"mentions",
			"is_thread",
			"message_type",
			"is_bot_message",
			"bot",
			"poll_id",
			"file_type",
			"file_size",
			"blurhash",
			"file_thumbnail",
			"thumbnail_width",
			"thumbnail_height",
			"internal_link",
			"links",
			"has_link",
		],
		"tokenizer": "unicode61 remove_diacritics 2 tokenchars '-_'",
	}

	# Define which doctypes to index and their field mappings
	INDEXABLE_DOCTYPES = {
		"Raven Message": {
			"fields": [
				"name",
				"content",
				"channel_id",
				"owner",
				"creation",
				"is_thread",
				"message_type",
				"is_bot_message",
				"bot",
				"poll_id",
				"file",
				"blurhash",
				"file_thumbnail",
				"thumbnail_width",
				"thumbnail_height",
				"links",
				"link_doctype",
				"link_document",
			],
		},
	}

	def get_search_filters(self):
		"""Return permission filters for current user"""
		# Get channels accessible to current user
		channel_list = get_channel_list()
		channel_list = [channel.get("name") for channel in channel_list]

		if not channel_list:
			return {"parent_channel_id": []}  # No access

		return {"parent_channel_id": channel_list}

	def prepare_document(self, doc):
		"""Custom document preparation"""
		link_document = None
		if doc.link_document:
			link_document = get_preview_data(doc.link_doctype, doc.link_document)
			lowerCaseDoctype = doc.link_doctype.lower().replace(" ", "-")
			doc.internal_link = f"/app/{lowerCaseDoctype}/{doc.link_document}"
			if not doc.content:
				doc.content = link_document.get("preview_title")

		document = super().prepare_document(doc)
		if not document:
			return None

		if link_document:
			document["title"] = link_document.get("preview_title")

		is_thread = frappe.db.get_value("Raven Channel", doc.channel_id, "is_thread")
		mentions = frappe.db.get_all("Raven Mention", {"parent": doc.name}, pluck="user")
		if mentions:
			# Convert list to | separated string for SQLite storage
			document["mentions"] = "|" + "|".join(mentions) + "|"
		if is_thread:
			parent_channel_id = frappe.db.get_value("Raven Message", doc.channel_id, "channel_id")
			document["parent_channel_id"] = parent_channel_id
		else:
			document["parent_channel_id"] = doc.channel_id

		document["has_link"] = 1 if doc.links else 0

		if doc.message_type == "File" or doc.message_type == "Image":
			file_name = doc.file.split("/")[-1]
			file_type = mimetypes.guess_type(file_name)[0]
			if file_type:
				file_extension = mimetypes.guess_extension(file_type)
				document["file_type"] = file_extension.lstrip(".").upper() if file_extension else None
			else:
				document["file_type"] = None
			document["internal_link"] = doc.file
			document["title"] = doc.file.split("?")[0].split("/")[-1]
			document["file_size"] = (
				frappe.db.get_value("File", {"file_url": doc.file.split("?")[0]}, "file_size") or 0
			)  # TODO: store this on message itself
		return document

	def index_doc(self, doctype, name):
		"""Override index_doc to handle custom fields properly"""
		# Get the document
		doc = frappe.db.get_value(doctype, name, self.INDEXABLE_DOCTYPES[doctype]["fields"], as_dict=1)
		doc["doctype"] = doctype
		self.raise_if_not_indexed()
		# Remove existing document first to prevent duplicates
		self.remove_doc(doctype, name)
		# Prepare the document with our custom fields
		document = self.prepare_document(doc)
		if document:
			# Index the prepared document
			self._index_documents([document])

	def _process_content(self, content):
		"""Override _process_content since our content is already processed"""
		if not content:
			return ""
		return content

	def get_list(self, filters=None, limit: int = 20):
		"""Get list of documents without a search query, applying filters and permissions"""
		if not self.is_search_enabled():
			return []

		self.raise_if_not_indexed()

		# Prepare filters
		filters = filters or {}
		permission_filters = self.get_search_filters()
		all_filters = {**filters, **permission_filters}

		# Build filter conditions
		filter_conditions = []
		filter_params = []

		for field, values in all_filters.items():
			if not values and isinstance(values, list):
				filter_conditions.append("1=0")
				continue

			if not values:
				continue

			if isinstance(values, list) and len(values) == 2 and values[0] == "LIKE":
				like_values = values[1]
				if isinstance(like_values, list):
					like_conditions = []
					for like_val in like_values:
						like_conditions.append(f"{field} LIKE ?")
						filter_params.append(f"%{like_val}%")
					filter_conditions.append(f"({' OR '.join(like_conditions)})")
				else:
					filter_conditions.append(f"{field} LIKE ?")
					filter_params.append(f"%{like_values}%")
			elif isinstance(values, list):
				if len(values) == 1:
					filter_conditions.append(f"{field} = ?")
					filter_params.append(values[0])
				else:
					placeholders = ",".join(["?" for _ in values])
					filter_conditions.append(f"{field} IN ({placeholders})")
					filter_params.extend(values)
			else:
				filter_conditions.append(f"{field} = ?")
				filter_params.append(values)

		filter_clause = ""
		if filter_conditions:
			filter_clause = "WHERE " + " AND ".join(filter_conditions)

		# Build SELECT clause
		text_fields = self.INDEX_SCHEMA["text_fields"]
		metadata_fields = self.INDEX_SCHEMA["metadata_fields"]

		select_fields = ["doc_id"]
		# Add text fields (title as title, etc.)
		for field in text_fields:
			select_fields.append(field)

		# Add metadata fields
		for field in metadata_fields:
			if field != "doc_id":
				select_fields.append(field)

		# Add compatibility fields for _process_search_results
		title_field = text_fields[0] if text_fields else "doc_id"
		select_fields.append("0.0 as bm25_score")
		select_fields.append(f"{title_field} as original_title")

		select_clause = ", ".join(select_fields)

		# Execute SQL
		sql = f"""
			SELECT {select_clause}
			FROM search_fts
			{filter_clause}
			ORDER BY creation DESC
			LIMIT {limit}
		"""
		raw_results = self.sql(sql, filter_params, read_only=True)

		# Process results through base class's processing logic
		return self._process_search_results(raw_results, "")


@frappe.whitelist()
def sqlite_search(query: str | None = None, filters=None, limit: int = 20):
	if filters:
		filters = json.loads(filters)

	search = RavenSearch()
	if not query:
		results = search.get_list(filters=filters, limit=limit)
	else:
		results = search.search(query, filters=filters)["results"]

	return results[:limit]


@frappe.whitelist()
def rebuild_search_index():
	search = RavenSearch()
	search.build_index()
	return "Search index rebuilt"


@frappe.whitelist()
def get_search_result(
	filter_type: str,
	search_text: str | None = None,
	from_user: str | None = None,
	in_channel: str | None = None,
	saved: bool = False,
	date: str | None = None,
	file_type: str | None = None,
	message_type: str | None = None,
	channel_type: str | None = None,
	my_channel_only: bool = False,
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
