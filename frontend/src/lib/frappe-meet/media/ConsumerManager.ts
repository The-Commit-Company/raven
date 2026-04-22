// @ts-nocheck
/**
 * Consumer Manager
 * Handles MediaSoup consumer lifecycle and stream management
 */

export class ConsumerManager {
	constructor() {
		this.consumers = new Map();
		this.eventHandlers = {};
	}

	setEventHandlers(handlers) {
		this.eventHandlers = { ...this.eventHandlers, ...handlers };
	}

	addConsumer(consumer, participantIdOverride = null) {
		if (!consumer?.id) {
			console.error("Invalid consumer provided");
			return false;
		}

		const entry = {
			id: consumer.id,
			participantId:
				participantIdOverride ||
				consumer.appData?.userId ||
				consumer.participantId,
			kind: consumer.kind,
			isScreen: consumer.appData?.type === "screen" || false,
			track: consumer.track,
			appData: consumer.appData,
			createdAt: Date.now(),
			consumer,
			close: consumer.close ? consumer.close.bind(consumer) : undefined,
			pause: consumer.pause ? consumer.pause.bind(consumer) : undefined,
			resume: consumer.resume ? consumer.resume.bind(consumer) : undefined,
		};

		this.consumers.set(consumer.id, entry);

		if (this.eventHandlers.onConsumerAdded) {
			this.eventHandlers.onConsumerAdded(entry);
		}

		return entry;
	}

	removeConsumer(consumerId) {
		const consumer = this.consumers.get(consumerId);
		if (consumer) {
			if (typeof consumer.close === "function") {
				try {
					consumer.close();
				} catch (error) {
					console.warn(`Error closing consumer ${consumerId}:`, error);
				}
			}

			this.consumers.delete(consumerId);

			if (this.eventHandlers.onConsumerRemoved) {
				this.eventHandlers.onConsumerRemoved(consumerId, consumer);
			}
		}
		return consumer;
	}

	getConsumer(consumerId) {
		return this.consumers.get(consumerId);
	}

	getAllConsumers() {
		return Array.from(this.consumers.values());
	}

	getConsumersByParticipant(participantId) {
		return this.getAllConsumers().filter(
			(consumer) => consumer.participantId === participantId,
		);
	}

	getConsumersByKind(kind) {
		return this.getAllConsumers().filter((consumer) => consumer.kind === kind);
	}

	getVideoConsumer(participantId) {
		return this.getAllConsumers().find(
			(consumer) =>
				consumer.participantId === participantId &&
				consumer.kind === "video" &&
				!consumer.isScreen,
		);
	}

	getAudioConsumer(participantId) {
		return this.getAllConsumers().find(
			(consumer) =>
				consumer.participantId === participantId && consumer.kind === "audio",
		);
	}

	getScreenShareConsumers() {
		return this.getAllConsumers().filter((consumer) => consumer.isScreen);
	}

	async pauseConsumer(consumerId) {
		const consumer = this.getConsumer(consumerId);
		if (consumer && typeof consumer.pause === "function") {
			try {
				await consumer.pause();
				console.log(`Consumer paused: ${consumerId}`);
				return true;
			} catch (error) {
				console.error(`Failed to pause consumer ${consumerId}:`, error);
			}
		}
		return false;
	}

	async resumeConsumer(consumerId) {
		const consumer = this.getConsumer(consumerId);
		if (consumer && typeof consumer.resume === "function") {
			try {
				await consumer.resume();
				console.log(`Consumer resumed: ${consumerId}`);
				return true;
			} catch (error) {
				console.error(`Failed to resume consumer ${consumerId}:`, error);
			}
		}
		return false;
	}

	async pauseParticipantConsumers(participantId, kind = null) {
		const consumers = this.getConsumersByParticipant(participantId);
		const filteredConsumers = kind
			? consumers.filter((c) => c.kind === kind)
			: consumers;

		const results = await Promise.all(
			filteredConsumers.map((consumer) => this.pauseConsumer(consumer.id)),
		);

		console.log(
			`Paused ${filteredConsumers.length} consumers for ${participantId}`,
		);
		return results;
	}

	async resumeParticipantConsumers(participantId, kind = null) {
		const consumers = this.getConsumersByParticipant(participantId);
		const filteredConsumers = kind
			? consumers.filter((c) => c.kind === kind)
			: consumers;

		const results = await Promise.all(
			filteredConsumers.map((consumer) => this.resumeConsumer(consumer.id)),
		);

		console.log(
			`Resumed ${filteredConsumers.length} consumers for ${participantId}`,
		);
		return results;
	}

	updateConsumer(consumerId, updates) {
		const consumer = this.consumers.get(consumerId);
		if (consumer) {
			const updatedConsumer = { ...consumer, ...updates };
			this.consumers.set(consumerId, updatedConsumer);

			if (this.eventHandlers.onConsumerUpdated) {
				this.eventHandlers.onConsumerUpdated(
					consumerId,
					updatedConsumer,
					updates,
				);
			}

			return updatedConsumer;
		}
		return null;
	}

	cleanupParticipantConsumers(participantId) {
		const consumers = this.getConsumersByParticipant(participantId);
		const removedConsumers = [];

		for (const consumer of consumers) {
			const removed = this.removeConsumer(consumer.id);
			if (removed) {
				removedConsumers.push(removed);
			}
		}

		return removedConsumers;
	}

	getConsumerStats() {
		const all = this.getAllConsumers();
		return {
			total: all.length,
			video: all.filter((c) => c.kind === "video").length,
			audio: all.filter((c) => c.kind === "audio").length,
			screenShare: all.filter((c) => c.isScreen).length,
			byParticipant: this.getConsumersByParticipantStats(),
		};
	}

	getConsumersByParticipantStats() {
		const stats = {};
		for (const consumer of this.getAllConsumers()) {
			if (!stats[consumer.participantId]) {
				stats[consumer.participantId] = { video: 0, audio: 0, screen: 0 };
			}
			if (consumer.isScreen) {
				stats[consumer.participantId].screen++;
			} else {
				stats[consumer.participantId][consumer.kind]++;
			}
		}
		return stats;
	}

	clear() {
		const consumerIds = Array.from(this.consumers.keys());

		// Close all consumers
		for (const consumer of this.consumers.values()) {
			if (typeof consumer.close === "function") {
				try {
					consumer.close();
				} catch (error) {
					console.warn("Error closing consumer during cleanup:", error);
				}
			}
		}

		this.consumers.clear();

		// Notify event handlers
		if (this.eventHandlers.onAllConsumersCleared) {
			this.eventHandlers.onAllConsumersCleared(consumerIds);
		}
	}
}
