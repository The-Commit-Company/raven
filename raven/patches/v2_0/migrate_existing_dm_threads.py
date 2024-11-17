import frappe


def execute():
	"""
	Any thread created in a DM channel needs to have the "is_dm_thread" flag set to true
	"""

	# Find all "is_thread" channels whose linked message belongs to a DM channel

	thread_channel = frappe.qb.DocType("Raven Channel")
	message = frappe.qb.DocType("Raven Message")
	message_channel = frappe.qb.DocType("Raven Channel")

	query = (
		frappe.qb.from_(thread_channel)
		.join(message)
		.on(thread_channel.name == message.name)
		.join(message_channel)
		.on(message.channel_id == message_channel.name)
		.select(thread_channel.name)
		.where(thread_channel.is_thread == 1)
		.where(message_channel.is_direct_message == 1)
	)

	results = query.run(as_dict=True)

	for result in results:
		frappe.db.set_value("Raven Channel", result.name, {"is_dm_thread": 1, "workspace": None})
