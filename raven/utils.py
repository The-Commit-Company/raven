import frappe

from raven.notification import clear_push_tokens_for_channel_cache


def track_channel_visit(channel_id, user=None, commit=False, publish_event_for_user=False):
	"""
	Track the last visit of the user to the channel.
	If the user is not a member of the channel, create a new member record
	"""

	if not user:
		user = frappe.session.user

	# Get the channel member record
	channel_member = get_channel_member(channel_id, user)

	now = frappe.utils.now()

	if channel_member:
		# Update the last visit
		frappe.db.set_value("Raven Channel Member", channel_member["name"], "last_visit", now)

	# Else if the user is not a member of the channel and the channel is open, create a new member record
	elif frappe.get_cached_value("Raven Channel", channel_id, "type") == "Open":
		frappe.get_doc(
			{
				"doctype": "Raven Channel Member",
				"channel_id": channel_id,
				"user_id": frappe.session.user,
				"last_visit": now,
			}
		).insert()

	# Need to commit the changes to the database if the request is a GET request
	if commit:
		frappe.db.commit()  # nosempgrep

	if publish_event_for_user:
		frappe.publish_realtime(
			"raven:unread_channel_count_updated",
			{"channel_id": channel_id, "sent_by": frappe.session.user, "last_message_timestamp": now},
			user=user,
		)

def track_channel_seen(channel_id, user=None, commit=False, publish_event_for_user=False):
	"""
	Track the last seen of the user to the channel.
	If the user is not a member of the channel, create a new member record
	"""

	if not user:
		user = frappe.session.user

	# Get the channel member record
	channel_member = get_channel_member(channel_id, user)

	now = frappe.utils.now()

	if channel_member:
		# Update the last seen
		frappe.db.set_value("Raven Channel Member", channel_member["name"], "seen_at", now)

	# Else if the user is not a member of the channel and the channel is open, create a new member record
	elif frappe.get_cached_value("Raven Channel", channel_id, "type") == "Open":
		frappe.get_doc(
			{
				"doctype": "Raven Channel Member",
				"channel_id": channel_id,
				"user_id": frappe.session.user,
				"seen_at": now,
			}
		).insert()

	# Need to commit the changes to the database if the request is a GET request
	if commit:
		frappe.db.commit()  # nosempgrep

	if publish_event_for_user:
		frappe.publish_realtime(
			"raven:unread_channel_count_updated",
			{"channel_id": channel_id, "sent_by": frappe.session.user, "last_message_timestamp": now},
			user=user,
		)


# Workspace Members
def get_workspace_members(workspace_id: str):
	"""
	Gets all members of a workspace from the cache
	"""
	cache_key = f"raven:workspace_members:{workspace_id}"

	data = frappe.cache().get_value(cache_key)
	if data:
		return data

	members = frappe.db.get_all(
		"Raven Workspace Member",
		filters={"workspace": workspace_id},
		fields=["name", "user", "is_admin"],
	)

	data = {member.user: member for member in members}
	frappe.cache().set_value(cache_key, data)
	return data


def delete_workspace_members_cache(workspace_id: str):
	cache_key = f"raven:workspace_members:{workspace_id}"
	frappe.cache().delete_value(cache_key)


def get_workspace_member(workspace_id: str, user: str = None) -> dict:
	"""
	Get the workspace member ID
	"""
	if not user:
		user = frappe.session.user

	return get_workspace_members(workspace_id).get(user, None)


def is_workspace_member(workspace_id: str, user: str = None) -> bool:
	"""
	Check if a user is a member of a workspace
	"""
	if not user:
		user = frappe.session.user

	all_members = get_workspace_members(workspace_id)

	return user in all_members


def get_channel_members(channel_id: str):
	"""
	Gets all members of a channel from the cache as a map - also includes the type of the user
	"""
	cache_key = f"raven:channel_members:{channel_id}"

	data = frappe.cache().get_value(cache_key)
	if data:
		return data

	raven_channel_member = frappe.qb.DocType("Raven Channel Member")
	raven_user = frappe.qb.DocType("Raven User")

	query = (
		frappe.qb.from_(raven_channel_member)
		.join(raven_user)
		.on(raven_channel_member.user_id == raven_user.name)
		.select(
			raven_channel_member.name,
			raven_channel_member.user_id,
			raven_channel_member.is_admin,
			raven_channel_member.allow_notifications,
			raven_user.type,
		)
		.where(raven_channel_member.channel_id == channel_id)
	)

	members = query.run(as_dict=True)

	data = {member.user_id: member for member in members}
	frappe.cache().set_value(cache_key, data)
	return data


def delete_channel_members_cache(channel_id: str, clear_push_tokens=True):
	"""
	Delete the channel members cache and clear the push tokens for the channel if the flag is set to True

	By default, the push tokens are cleared when the channel members cache is deleted
	"""
	cache_key = f"raven:channel_members:{channel_id}"
	frappe.cache().delete_value(cache_key)

	if clear_push_tokens:
		clear_push_tokens_for_channel_cache(channel_id)

	frappe.publish_realtime(
		"channel_members_updated",
		{"channel_id": channel_id},
		room="all",
		after_commit=True,
	)


def get_channel_member(channel_id: str, user: str = None) -> dict:
	"""
	Get the channel member ID
	"""

	if not user:
		user = frappe.session.user

	all_members = get_channel_members(channel_id)

	return all_members.get(user, None)


def is_channel_member(channel_id: str, user: str = None) -> bool:
	"""
	Check if a user is a member of a channel
	"""
	if not user:
		user = frappe.session.user

	return user in get_channel_members(channel_id)


def get_raven_user(user_id: str) -> str:
	"""
	Get the Raven User ID of a user
	"""
	# TODO: Run this via cache
	return frappe.db.get_value("Raven User", {"user": user_id}, "name")


def get_thread_reply_count(thread_id: str) -> int:
	"""
	Get the number of replies in a thread
	"""
	return frappe.cache().hget(
		"raven:thread_reply_count",
		thread_id,
		lambda: frappe.db.count("Raven Message", {"channel_id": thread_id}),
	)


def refresh_thread_reply_count(thread_id: str):
	"""
	Refresh the thread reply count
	"""
	new_count = frappe.db.count("Raven Message", {"channel_id": thread_id})
	frappe.cache().hset("raven:thread_reply_count", thread_id, new_count)

	return new_count


def clear_thread_reply_count_cache(thread_id: str):
	"""
	Clear the thread reply count cache
	"""
	frappe.cache().hdel("raven:thread_reply_count", thread_id)
