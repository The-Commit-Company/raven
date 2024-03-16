import frappe
from frappe import _


@frappe.whitelist()
def remove_channel_member(user_id, channel_id):
	# Get raven channel member name where user_id and channel_id match
	member = frappe.db.get_value(
		"Raven Channel Member", {"user_id": user_id, "channel_id": channel_id}, ["name"]
	)
	# Delete raven channel member
	if member:
		frappe.delete_doc("Raven Channel Member", member)
	else:
		frappe.throw(_("User is not a member of this channel"))

	return True
