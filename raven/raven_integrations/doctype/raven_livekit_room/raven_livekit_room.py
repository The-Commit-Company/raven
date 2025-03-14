# Copyright (c) 2025, The Commit Company (Algocode Technologies Pvt. Ltd.) and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RavenLiveKitRoom(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		from raven.raven_integrations.doctype.raven_livekit_room_participants.raven_livekit_room_participants import (
			RavenLiveKitRoomParticipants,
		)

		channel_id: DF.Link
		description: DF.SmallText | None
		invite_entire_channel: DF.Check
		participants: DF.Table[RavenLiveKitRoomParticipants]
		room_name: DF.Data
		workspace: DF.Link | None
	# end: auto-generated types

	def after_insert(self):
		# Create a Raven Message and send it to the channel

		frappe.get_doc(
			{
				"doctype": "Raven Message",
				"channel_id": self.channel_id,
				"message_type": "Text",
				"link_doctype": "Raven LiveKit Room",
				"link_document": self.name,
				"text": "",
				"content": f"Created a new call: {self.room_name}",
			}
		).insert()
