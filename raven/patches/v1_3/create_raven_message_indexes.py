from raven.api.raven_message import on_doctype_update
def execute():
    # Indexing all Raven Messages
    on_doctype_update()
