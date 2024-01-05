from __future__ import unicode_literals
import frappe
from raven.api.raven_search import RavenSearch


@frappe.whitelist()
def search(query, start=0):

    search = RavenSearch()
    query = search.clean_query(query)

    query_parts = query.split(" ")
    if len(query_parts) == 1 and not query_parts[0].endswith("*"):
        query = f"{query_parts[0]}*"
    if len(query_parts) > 1:
        query = " ".join([f"%%{q}%%" for q in query_parts])

    result = search.search(
        f"@content:({query})", start=start, sort_by="creation desc", highlight=True, with_payloads=True
    )

    grouped_results = {}
    for d in result.docs:
        doctype, name = d.id.split(":")
        d.doctype = doctype
        d.name = name
        del d.id
        d.channel_id = d.payload.get("channel_id")
        d.owner = d.payload.get("owner")
        del d.payload
        grouped_results.setdefault(doctype, []).append(d)

    return {
        "results": grouped_results,
        "total": result.total,
        "duration": result.duration,
    }
