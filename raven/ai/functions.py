import frappe


def create_documents(doctype: str, data: list):
	"""
	Create documents in the database
	"""
	docs = []
	for item in data:
		doc = frappe.get_doc({"doctype": doctype, **item})
		doc.insert()
		docs.append(doc.name)

	return {"documents": docs, "message": "Documents created"}
