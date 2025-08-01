import frappe
from typing import Dict, Any, Iterable, Union
from frappe.model.document import Document

DEFAULT_ROOT_FIELDS_TO_STRIP = {
    "modified",
    "modified_by",
    "creation",
    "created_by",
    "docstatus",
    "owner",
    "_assign",
    "_comments",
    "_user_tags",
    "_liked_by",
    "idx",
}


DEFAULT_CHILD_LINK_FIELDS = DEFAULT_ROOT_FIELDS_TO_STRIP | {
    "parent",
    "parentfield",
    "parenttype",
}

ADDITIONAL_FIELDS_TO_STRIP_FROM_RAVEN_BOT = {
    "openai_assistant_id",
    "raven_user"
}

def scrub_doc(
    doc: Union[Dict[str, Any], "Document"],
    *,
    extra_fields_to_strip: Iterable[str] = (),
    strip_child_parent_links: bool = True,
    keep_name: bool = False,
) -> Dict[str, Any]:
    """
    Return a deep-cloned, field-stripped dict version of a Frappe document (or plain dict).

    Parameters
    ----------
    doc : dict | frappe.model.document.Document
        The source document to scrub.
    extra_fields_to_strip : Iterable[str]
        Any additional field names to remove (root + children).
    strip_child_parent_links : bool
        If True, remove 'parent', 'parentfield', 'parenttype' from child rows.
    keep_name : bool
        If False, also remove the 'name' field from root & children.

    Returns
    -------
    dict
        A new dict with stripped fields (root + any nested child tables).
    """

    # Convert Document -> dict safely
    if Document and isinstance(doc, Document):
        raw: Dict[str, Any] = doc.as_dict()
    else:
        raw = dict(doc)  # shallow copy first; we'll deep-copy selectively

    root_strip = set(DEFAULT_ROOT_FIELDS_TO_STRIP) | set(extra_fields_to_strip)
    child_strip = set(DEFAULT_CHILD_LINK_FIELDS) | set(extra_fields_to_strip)

    if not keep_name:
        root_strip.add("name")
        child_strip.add("name")

    def _clean(value: Any, is_child: bool = False) -> Any:
        # dict-like
        if isinstance(value, dict):
            to_strip = child_strip if is_child else root_strip
            cleaned: Dict[str, Any] = {}
            for k, v in value.items():
                if k in to_strip:
                    continue

                # Detect child table rows (they usually have parent/parenttype/doctype)
                # but we already pass is_child=True where appropriate
                if isinstance(v, list):
                    cleaned[k] = [_clean(item, is_child=True) if isinstance(item, dict) else item for item in v]
                elif isinstance(v, dict):
                    cleaned[k] = _clean(v, is_child=True)
                else:
                    cleaned[k] = v
            return cleaned

        # list-like
        if isinstance(value, list):
            return [_clean(item, is_child=True) if isinstance(item, dict) else item for item in value]

        # primitives
        return value

    cleaned_root = _clean(raw, is_child=False)

    if strip_child_parent_links:
        # they're already stripped by child_strip; nothing extra to do
        pass

    return cleaned_root


def get_raven_bot_json(bot_id:str):
    '''
        Returns the JSON data of the Raven Bot Data, which Include Raven AI Bot Functions documents as well as the Raven File Source documents.
    '''

    file_urls = {}

    doc = frappe.get_doc("Raven Bot", bot_id)
    scrubed_doc = scrub_doc(doc, ADDITIONAL_FIELDS_TO_STRIP_FROM_RAVEN_BOT)

    file_urls["raven_bot_image"] = scrubed_doc.get("image")

    bot_functions = scrubed_doc.get("bot_functions", [])

    for func in bot_functions:
        func_name = func.get("function")
        function_doc = frappe.get_doc("Raven AI Function", func_name)
        scrubed_function_doc = scrub_doc(function_doc)
        func["function_data"] = scrubed_function_doc
    
    file_sources = scrubed_doc.get("file_sources", [])
    for source in file_sources:
        source_name = source.get("file")
        file_source_doc = frappe.get_doc("Raven AI File Source", source_name)
        scrubed_file_source_doc = scrub_doc(file_source_doc)
        scrubed_file_source_doc.pop("openai_file_id", None)
        file_url = scrubed_file_source_doc.get("file")
        source["function_data"] = scrubed_file_source_doc
        file_urls.setdefault("file_source", {})[source_name] = file_url

    return {
        "doc": scrubed_doc,
        "file_urls": file_urls
    }