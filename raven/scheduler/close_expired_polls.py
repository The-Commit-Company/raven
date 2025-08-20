import frappe


def close_expired_polls():
	"""Close expired polls by setting is_disabled = 1"""
	frappe.db.set_value(
		"Raven Poll", {"end_date": ["<", frappe.utils.now()], "is_disabled": 0}, "is_disabled", 1
	)
