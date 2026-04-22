// @ts-nocheck
/**
 * Participant Manager
 * Handles participant state management and updates
 */

export class ParticipantManager {
	constructor() {
		this.participants = new Map();
		this.eventHandlers = {};
	}

	setEventHandlers(handlers) {
		this.eventHandlers = { ...this.eventHandlers, ...handlers };
	}

	addParticipant(participantData) {
		const participant = {
			user_id: participantData.participantId || participantData.user_id,
			user_name:
				participantData.userData?.name ||
				participantData.user_name ||
				participantData.participantId,
			avatar:
				participantData.userData?.avatar || participantData.avatar || null,
			initials: this.generateInitials(
				participantData.userData?.name ||
					participantData.user_name ||
					participantData.participantId,
			),
			audio_enabled: participantData.userData?.audio_enabled,
			video_enabled: participantData.userData?.video_enabled,
			is_guest: participantData.userData?.is_guest,
			...participantData,
		};

		this.participants.set(participant.user_id, participant);

		if (this.eventHandlers.onParticipantAdded) {
			this.eventHandlers.onParticipantAdded(participant);
		}

		return participant;
	}

	removeParticipant(participantId) {
		const participant = this.participants.get(participantId);
		if (participant) {
			this.participants.delete(participantId);

			if (this.eventHandlers.onParticipantRemoved) {
				this.eventHandlers.onParticipantRemoved(participantId, participant);
			}
		}
		return participant;
	}

	updateParticipant(participantId, updates) {
		const participant = this.participants.get(participantId);
		if (participant) {
			const updatedParticipant = { ...participant, ...updates };
			this.participants.set(participantId, updatedParticipant);

			if (this.eventHandlers.onParticipantUpdated) {
				this.eventHandlers.onParticipantUpdated(
					participantId,
					updatedParticipant,
					updates,
				);
			}
			return updatedParticipant;
		}
		return null;
	}

	getParticipant(participantId) {
		return this.participants.get(participantId);
	}

	getAllParticipants() {
		return Array.from(this.participants.values());
	}

	getParticipantsMap() {
		return new Map(this.participants);
	}

	updateMediaState(participantId, { audioEnabled, videoEnabled }) {
		const updates = {};
		if (typeof audioEnabled !== "undefined") {
			updates.audio_enabled = audioEnabled;
		}
		if (typeof videoEnabled !== "undefined") {
			updates.video_enabled = videoEnabled;
		}

		if (Object.keys(updates).length > 0) {
			return this.updateParticipant(participantId, updates);
		}
		return null;
	}

	hasParticipant(participantId) {
		return this.participants.has(participantId);
	}

	getParticipantCount() {
		return this.participants.size;
	}

	getVideoEnabledParticipants() {
		return this.getAllParticipants().filter((p) => p.video_enabled);
	}

	getAudioEnabledParticipants() {
		return this.getAllParticipants().filter((p) => p.audio_enabled);
	}

	generateInitials(name) {
		if (!name) return "UN";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}

	clear() {
		const participantIds = Array.from(this.participants.keys());
		this.participants.clear();

		if (this.eventHandlers.onAllParticipantsCleared) {
			this.eventHandlers.onAllParticipantsCleared(participantIds);
		}
	}

	syncParticipants(serverParticipants = []) {
		const currentIds = new Set(this.participants.keys());
		const serverIds = new Set();

		for (const serverParticipant of serverParticipants) {
			const participantId =
				serverParticipant.participantId || serverParticipant.user_id;
			serverIds.add(participantId);

			if (this.hasParticipant(participantId)) {
				this.updateParticipant(participantId, serverParticipant);
			} else {
				this.addParticipant(serverParticipant);
			}
		}

		for (const currentId of currentIds) {
			if (!serverIds.has(currentId)) {
				this.removeParticipant(currentId);
			}
		}
	}
}
