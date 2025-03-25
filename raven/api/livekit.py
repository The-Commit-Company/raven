import frappe
from frappe import _
from livekit import api


@frappe.whitelist(methods=["POST"])
def join_room(room_id: str):

	# We need to check if the user has read access to the room
	room = frappe.get_doc("Raven LiveKit Room", room_id)

	if not room.has_permission():
		frappe.throw(_("You do not have permission to join this room."))

	user = frappe.session.user

	participant_name = frappe.db.get_value("Raven User", user, "full_name")

	if not participant_name:
		frappe.throw(_("User not found"))

	# We now need to generate a token for the user
	raven_settings = frappe.get_doc("Raven Settings")

	if not raven_settings.enable_video_calling_via_livekit:
		frappe.throw(_("Video calling is not enabled."))

	api_secret = raven_settings.get_password("livekit_api_secret")

	token = (
		api.AccessToken(raven_settings.livekit_api_key, api_secret)
		.with_identity(user)
		.with_name(participant_name)
		.with_grants(api.VideoGrants(room_join=True, room=room_id))
	)

	return {
		"serverUrl": raven_settings.livekit_url,
		"participantToken": token.to_jwt(),
		"roomID": room_id,
		"roomName": room.room_name,
		"participantName": participant_name,
		"channelID": room.channel_id,
		"workspaceID": room.workspace,
	}


@frappe.whitelist(methods=["GET"])
def get_room_details(room_id: str):
	room = frappe.get_cached_doc("Raven LiveKit Room", room_id)

	if not room.has_permission():
		frappe.throw(_("You do not have permission to view the details of this call."))

	return room
