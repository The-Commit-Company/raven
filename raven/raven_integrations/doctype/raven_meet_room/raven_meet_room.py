# Copyright (c) 2026, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class RavenMeetRoom(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from raven.raven_integrations.doctype.raven_meet_room_participants.raven_meet_room_participants import (
			RavenMeetRoomParticipants,
		)

		channel_id: DF.Link
		description: DF.SmallText | None
		invite_entire_channel: DF.Check
		meeting_id: DF.Data | None
		participants: DF.Table[RavenMeetRoomParticipants]
		room_name: DF.Data
		workspace: DF.Link | None
	# end: auto-generated types

	def before_insert(self):
		"""Create a matching meeting on the Frappe Meet (`meet`) app.

		The `meet` app exposes `meet.api.meeting.create` which creates a
		`Sae Meeting` document and returns its name. We store that name
		in `meeting_id` so that `raven.api.frappe_meet.join_room` can
		later fetch the SFU connection details from `meet`.

		We intentionally do this in `before_insert` (not `after_insert`)
		so that failures in `meet` surface as a hard error before the
		room is persisted on Raven.
		"""
		if self.meeting_id:
			return

		if "meet" not in frappe.get_installed_apps():
			frappe.throw(
				_(
					"Frappe Meet (`meet`) app is not installed on this site. "
					"Install it (`bench get-app meet && bench --site <site> install-app meet`) "
					"or disable the Frappe Meet integration in Raven Settings."
				)
			)

		from meet.api.meeting import create as create_meeting

		self.meeting_id = create_meeting(meeting_type="open", allow_guest=True)

	def after_insert(self):
		"""Populate participants (if requested) and post a message in the channel.

		Mirrors the Raven LiveKit Room pattern (PR #1486): the room is
		announced to the channel by a text message carrying a
		`link_doctype` / `link_document` pointing at this room, which
		Raven's frontend turns into a clickable "Join Call" card via
		`DoctypeLinkMessageRenderer`.
		"""
		self._add_channel_members_as_participants()
		self._post_announcement_message()

	def _add_channel_members_as_participants(self):
		"""Add every member of the channel as a participant.

		Only runs if `invite_entire_channel` is set. The owner is added
		first so that they are always listed even if they are not (yet)
		a channel member.
		"""
		seen = {self.owner}
		participants = [{"raven_user": self.owner}]

		if self.invite_entire_channel:
			channel_members = frappe.get_all(
				"Raven Channel Member",
				filters={"channel_id": self.channel_id},
				pluck="user_id",
			)
			for member in channel_members:
				if member not in seen:
					seen.add(member)
					participants.append({"raven_user": member})

		# Write the child table directly to avoid an extra .save() round-trip
		# which would re-trigger after_insert in a loop.
		for p in participants:
			self.append("participants", p)
		if participants:
			self.db_update()
			for p in self.participants:
				p.db_insert()

	def _post_announcement_message(self):
		"""Post a Raven Message in the channel linking to this room."""
		text = _("Started a video call: <strong>{0}</strong>").format(
			frappe.utils.escape_html(self.room_name)
		)
		frappe.get_doc(
			{
				"doctype": "Raven Message",
				"channel_id": self.channel_id,
				"message_type": "Text",
				"text": text,
				"content": self.room_name,
				"link_doctype": "Raven Meet Room",
				"link_document": self.name,
				"hide_link_preview": 1,
			}
		).insert(ignore_permissions=True)
