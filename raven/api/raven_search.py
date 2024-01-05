from __future__ import unicode_literals
import re
import frappe
from raven.utils.search import Search
from frappe.utils import strip_html_tags, update_progress_bar, cstr

UNSAFE_CHARS = re.compile(r"[\[\]{}<>+]")


class RavenSearch(Search):
    def __init__(self) -> None:
        schema = [
            {"name": "content", "weight": 5},
            {"name": "message_type", "type": "tag"},
            {"name": "channel_id", "type": "tag"},
            {"name": "owner", "type": "tag"},
            {"name": "creation", "sortable": True},
        ]
        super().__init__("raven_idx", "search_doc", schema)

    def search(self, query, **kwargs):
        if query:
            accessible_channels = "|".join(self.get_accessible_channels())
            channels_query = f"@channel_id:{{{accessible_channels}}}"
            query = f"{query} {channels_query}"
        return super().search(query, **kwargs)

    def clean_query(self, query):
        query = query.strip().replace("-*", "*")
        query = UNSAFE_CHARS.sub(" ", query)
        query = query.strip()
        return query

    def build_index(self):
        self.drop_index()
        self.create_index()
        records = self.get_records()
        total = len(records)
        for i, doc in enumerate(records):
            self.index_doc(doc)
            if not hasattr(frappe.local, "request"):
                update_progress_bar("Indexing", i, total)
        if not hasattr(frappe.local, "request"):
            print()

    def index_doc(self, doc):
        id, fields, payload = None, None, None
        if doc.doctype == "Raven Message":
            id = f"Raven Message:{doc.name}"
            fields = {
                "channel_id": doc.channel_id,
                "message_type": doc.message_type,
                "content": strip_html_tags(doc.text) + doc.file,
                "creation": doc.creation,
                "owner": doc.owner,
            }
            payload = {
                "owner": doc.owner,
                "channel_id": doc.channel_id,
            }
        if id and fields and payload:
            self.add_document(id, fields, payload=payload)

    def remove_doc(self, doc):
        id = None
        if doc.doctype == "Raven Message":
            id = f"Raven Message:{doc.name}"
        if id:
            self.remove_document(id)

    def get_records(self):
        records = []
        for d in frappe.db.get_all("Raven Message", fields=["name", "channel_id", "message_type", "text", "file", "creation", "owner"]):
            d.doctype = "Raven Message"
            records.append(d)
        return records

    def get_accessible_channels(self):
        # get all channels that the user has access to
        current_user = frappe.session.user
        member = frappe.qb.DocType("Raven Channel Member")
        channels = (
            frappe.qb.from_(member)
            .select(member.channel_id)
            .distinct()
            .where(member.user_id == current_user)
            .run(pluck=True)
        )
        return [cstr(c) for c in channels]


def build_index():
    frappe.cache().set_value("messages_index_in_progress", True)
    search = RavenSearch()
    search.build_index()
    frappe.cache().set_value("messages_index_in_progress", False)


def build_index_in_background():
    if not frappe.cache().get_value("messages_index_in_progress"):
        frappe.enqueue(build_index, queue="long")


def build_index_if_not_exists():
    search = RavenSearch()
    if not search.index_exists():
        build_index()
