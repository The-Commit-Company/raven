# Copyright (c) 2026, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

"""Raven <-> Frappe Meet bridge.

Thin wrapper around the `meet` app (https://github.com/frappe/meet).
Raven creates a `Raven Meet Room` document per call; behind the scenes
the corresponding `Sae Meeting` on `meet` is what the SFU connects to.
These endpoints mirror the shape of `raven.api.livekit` introduced in
PR #1486 so the frontend pattern stays consistent across providers.
"""

import frappe
from frappe import _


def _ensure_meet_installed() -> None:
	"""Abort with a user-friendly message if the `meet` app is missing."""
	if "meet" not in frappe.get_installed_apps():
		frappe.throw(
			_(
				"Frappe Meet (`meet`) app is not installed on this site. "
				"Install it (`bench get-app meet && bench --site <site> install-app meet`) "
				"or disable the Frappe Meet integration in Raven Settings."
			)
		)


@frappe.whitelist(methods=["GET"])
def get_room_details(room_id: str):
	"""Return the `Raven Meet Room` document for the given room ID.

	Used by the message renderer to display the room name / description
	on the announcement card in the channel. Access is gated by the
	room's standard permission hook (see `raven.permissions`).
	"""
	room = frappe.get_cached_doc("Raven Meet Room", room_id)

	if not room.has_permission():
		frappe.throw(_("You do not have permission to view the details of this call."))

	return room


@frappe.whitelist(methods=["POST"])
def join_room(room_id: str) -> dict:
	"""Return the SFU connection details needed to join the call.

	Delegates to `meet.api.meeting.get_sfu_connection_details` which
	handles the tenant-aware JWT generation (see `meet/utils/sfu_config.py`).
	We enrich the response with room metadata (`room_name`, `channel_id`,
	`workspace`) so the frontend can render a proper meeting header
	without a second round-trip.
	"""
	_ensure_meet_installed()

	room = frappe.get_doc("Raven Meet Room", room_id)

	if not room.has_permission():
		frappe.throw(_("You do not have permission to join this call."))

	if not room.meeting_id:
		frappe.throw(_("This room has no linked Frappe Meet session."))

	from meet.api.meeting import get_sfu_connection_details

	details = get_sfu_connection_details(room.meeting_id)

	return {
		**details,
		"room_id": room.name,
		"room_name": room.room_name,
		"channel_id": room.channel_id,
		"workspace": room.workspace,
	}
