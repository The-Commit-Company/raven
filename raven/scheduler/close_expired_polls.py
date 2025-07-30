import frappe


def close_expired_polls():
	"""Close expired polls by setting is_disabled = 1"""
	frappe.db.sql("""
		UPDATE `tabRaven Poll` 
		SET is_disabled = 1 
		WHERE end_date <= NOW() 
		AND is_disabled = 0
	""")
