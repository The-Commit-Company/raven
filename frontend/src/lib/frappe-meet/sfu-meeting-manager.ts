// @ts-nocheck
/**
 * SFU Meeting Manager
 * Orchestrates all meeting-related functionality (glue of all modules)
 */

import { ConsumerManager } from "./media/ConsumerManager";
import { ParticipantManager } from "./media/ParticipantManager";
import { TransportManager } from "./media/TransportManager";
import { VideoElementManager } from "./media/VideoElementManager";
import { getSFUClient } from "./sfu-client";

function createMediaHandler() {
	return {
		localStream: null,
		audioProducer: null,
		videoProducer: null,
		screenProducer: null,
		setProducers(producers = {}) {
			Object.assign(this, producers);
		},
		stopScreenShare() {
			this.screenProducer = null;
		},
		cleanup() {
			for (const producer of [
				this.audioProducer,
				this.videoProducer,
				this.screenProducer,
			]) {
				try {
					producer?.close?.();
				} catch (error) {
					console.warn("Failed to close producer during cleanup:", error);
				}
			}

			this.localStream = null;
			this.audioProducer = null;
			this.videoProducer = null;
			this.screenProducer = null;
		},
	};
}

class SFUMeetingManager {
	constructor() {
		this.meetingId = null;
		this.currentUser = { value: null };
		this.isConnected = false;
		this.isSetupComplete = false;
		this.initialSyncInProgress = false;
		this.bufferedProducerEvents = [];
		this.processedConsumers = new Set();
		this.isScreenShareActive = false;

		this.videoManager = new VideoElementManager();
		this.participantManager = new ParticipantManager();
		this.consumerManager = new ConsumerManager();
		this.transportManager = new TransportManager();
		this.mediaHandler = createMediaHandler();

		this.sfuClient = null;
		this.eventHandlers = {};
		this.recoveryInProgress = false;
		this.lastRecoveryAt = 0;

		this.eventTarget = new EventTarget();
	}

	initialize(options) {
		this.meetingId = options.meetingId;
		this.currentUser = this.ensureRef(options.currentUser);
		this.eventHandlers = options.eventHandlers || {};

		this.setupManagerEventHandlers();
	}

	setupManagerEventHandlers() {
		// Participant manager events
		this.participantManager.setEventHandlers({
			onParticipantAdded: (participant) => {
				if (this.eventHandlers.onParticipantJoined) {
					this.eventHandlers.onParticipantJoined(participant);
				}
			},
			onParticipantRemoved: (participantId, participant) => {
				this.videoManager.removeVideoElement(participantId);
				this.consumerManager.cleanupParticipantConsumers(participantId);
				if (this.eventHandlers.onParticipantLeft) {
					this.eventHandlers.onParticipantLeft({ participantId, participant });
				}
			},
			onParticipantUpdated: (participantId, participant, updates) => {
				if (this.eventHandlers.onParticipantUpdated) {
					this.eventHandlers.onParticipantUpdated(
						participantId,
						participant,
						updates,
					);
				}
			},
		});

		// Consumer manager events
		this.consumerManager.setEventHandlers({
			onConsumerAdded: (consumer) => {
				this.handleNewConsumer(consumer);
			},
			onConsumerRemoved: (consumerId, consumer) => {
				this.processedConsumers?.delete?.(consumerId);

				// If this was a screen-share consumer, notify UI to clear screen-share state
				if (
					consumer &&
					(consumer.isScreen || consumer?.appData?.type === "screen")
				) {
					this.isScreenShareActive = false;
					if (this.eventHandlers.onScreenShareStopped) {
						this.eventHandlers.onScreenShareStopped({
							participantId: consumer.participantId,
							consumerId,
						});
					}
				}
			},
		});

		this.transportManager.setEventHandlers({
			onTransportConnectionStateChange: ({ direction, state }) => {
				this.handleTransportConnectionStateChange(direction, state);
			},
		});
	}

	async connect(authToken = null) {
		if (this.isConnected) {
			return true;
		}

		try {
			this.sfuClient = getSFUClient();
			await this.sfuClient.connect(this.meetingId, authToken);
			this.isConnected = true;

			// Initialize transport manager with SFU client
			this.transportManager.initialize(this.sfuClient);

			// Set up SFU event handlers
			this.setupSFUEventHandlers();

			return true;
		} catch (error) {
			console.error("Failed to connect to SFU:", error);
			throw error;
		}
	}

	async joinRoom(userData, mediaState) {
		try {
			await this.sfuClient.joinRoom(this.meetingId, userData, mediaState);
			console.log("Successfully joined room:", this.meetingId);

			return true;
		} catch (error) {
			console.error("Failed to join room:", error);
			throw error;
		}
	}

	async initializeDevice() {
		try {
			await this.transportManager.initializeDevice();
			return true;
		} catch (error) {
			console.error("Failed to initialize MediaSoup device:", error);
			throw error;
		}
	}

	async createReceiveTransport() {
		try {
			await this.transportManager.createReceiveTransport();
			return true;
		} catch (error) {
			console.warn("Failed to create receive transport:", error);
			return false;
		}
	}

	async publishMedia(localStream, options = {}) {
		const { publishVideo = true, publishAudio = true } = options;
		const results = {};

		try {
			this.mediaHandler.localStream = localStream;

			await this.transportManager.createSendTransport();

			if (publishVideo && localStream) {
				const videoTrack = localStream.getVideoTracks()[0];
				if (videoTrack) {
					try {
						const videoProducer = await this.transportManager.createProducer(
							videoTrack,
							{ type: "camera" },
						);
						results.videoProducer = videoProducer;
						this.mediaHandler.setProducers({ videoProducer });
						console.log("Video published successfully");
					} catch (error) {
						console.warn(
							"Failed to publish video, continuing without video:",
							error.message,
						);
					}
				}
			}

			if (publishAudio && localStream) {
				const audioTrack = localStream.getAudioTracks()[0];
				if (audioTrack) {
					try {
						const audioProducer = await this.transportManager.createProducer(
							audioTrack,
							{ type: "microphone" },
						);
						results.audioProducer = audioProducer;
						this.mediaHandler.setProducers({ audioProducer });
						console.log("Audio published successfully");
					} catch (error) {
						console.warn(
							"Failed to publish audio, continuing without audio:",
							error.message,
						);
					}
				}
			}
			console.log("Media published successfully");
			return results;
		} catch (error) {
			console.error("Failed to publish media:", error);
			throw error;
		}
	}

	async setupExistingParticipants() {
		try {
			this.initialSyncInProgress = true;

			const participants = await this.sfuClient.getRoomParticipants();

			// Get current user ID to filter out self from participants
			const currentUserId = this.getCurrentUserId();

			const normalized = (participants || [])
				.map((p) => {
					const pid = p.user_id || p.id;
					const info = p.info || {};
					return {
						participantId: pid,
						user_id: pid,
						user_name: info.name || info.user_name || pid,
						avatar: info.avatar || null,
						audio_enabled:
							typeof info.audio_enabled === "boolean"
								? info.audio_enabled
								: false,
						video_enabled:
							typeof info.video_enabled === "boolean"
								? info.video_enabled
								: false,
						is_guest: info.is_guest || false,
					};
				})
				.filter((p) => p.user_id !== currentUserId);

			this.participantManager.syncParticipants(normalized);

			await this.requestExistingProducers();

			await this.flushBufferedProducers();

			this.initialSyncInProgress = false;
		} catch (error) {
			console.error("Error in setupExistingParticipants:", error);
			this.initialSyncInProgress = false;
			throw error;
		}
	}

	async requestExistingProducers() {
		try {
			const existingProducers = await this.sfuClient.getExistingProducers();

			if (existingProducers?.length) {
				console.log(
					`Found ${existingProducers.length} existing producers:`,
					existingProducers.map((p) => ({
						id: p.id,
						participantId: p.participantId || p.user_id || p.userId,
						kind: p.kind,
						isScreen: !!p.isScreen,
					})),
				);

				for (const producerInfo of existingProducers) {
					const participantId =
						producerInfo.participantId ||
						producerInfo.user_id ||
						producerInfo.userId;

					console.log("Subscribing to existing producer:", {
						producerId: producerInfo.id,
						participantId,
						kind: producerInfo.kind,
						isScreen: !!producerInfo.isScreen,
					});
					await this.subscribeToRemoteProducer({
						producerId: producerInfo.id,
						participantId,
						isScreen: producerInfo.isScreen,
					});
				}
			} else {
				console.log("No existing producers found");
			}

			return existingProducers;
		} catch (error) {
			console.warn("Failed to request existing producers:", error);
			return null;
		}
	}

	async subscribeToProducer(producerId, participantId, metadata = {}) {
		try {
			const consumer = await this.transportManager.createConsumer(
				producerId,
				metadata,
			);

			const enhancedConsumer = this.consumerManager.addConsumer(
				consumer,
				participantId,
			);

			// for adaptive streaming
			if (enhancedConsumer && enhancedConsumer.kind === "video") {
				this.eventTarget.dispatchEvent(
					new CustomEvent("consumerReady", {
						detail: {
							consumerId: enhancedConsumer.id,
							participantId,
							kind: enhancedConsumer.kind,
						},
					}),
				);
			}

			return enhancedConsumer;
		} catch (error) {
			console.error(`Failed to subscribe to producer ${producerId}:`, error);
			throw error;
		}
	}

	async subscribeToRemoteProducer({ producerId, participantId, isScreen }) {
		if (!producerId || !participantId) {
			return null;
		}

		if (participantId === this.getCurrentUserId()) {
			return null;
		}

		return this.subscribeToProducer(producerId, participantId, {
			isScreen: !!isScreen,
		});
	}

	async handleNewConsumer(consumer) {
		const { participantId, kind, isScreen } = consumer;

		if (this.processedConsumers?.has?.(consumer?.id)) {
			return;
		}

		if (!this.processedConsumers) {
			this.processedConsumers = new Set();
		}
		this.processedConsumers.add(consumer?.id);

		if (!participantId) {
			return;
		}

		const currentUserId = this.getCurrentUserId();
		if (participantId === currentUserId) {
			return;
		}

		if (!this.participantManager.hasParticipant(participantId)) {
			this.participantManager.addParticipant({
				user_id: participantId,
				user_name: participantId, // Will be updated when participant data arrives
			});
		}

		if (isScreen) {
			await this.handleScreenShareConsumer(consumer);
			return;
		}

		if (kind === "video") {
			await this.attachVideoConsumer(participantId, consumer);
		} else if (kind === "audio") {
			await this.attachAudioConsumer(participantId, consumer);
		}
	}

	async attachVideoConsumer(participantId, consumer) {
		try {
			// only attach the video track as audio is managed separately
			const stream = new MediaStream([consumer.track]);

			await this.videoManager.attachStream(participantId, stream, false);

			const participant = this.participantManager.getParticipant(participantId);
			if (participant && !participant.video_enabled) {
				this.participantManager.updateParticipant(participantId, {
					video_enabled: true,
				});
			}
		} catch (error) {
			console.error(
				`Failed to attach video consumer for ${participantId}:`,
				error,
			);
		}
	}

	async attachAudioConsumer(participantId, consumer) {
		try {
			// Only attach the audio track as video is managed separately
			const stream = new MediaStream([consumer.track]);

			await this.videoManager.attachStream(participantId, stream, false);
		} catch (error) {
			console.error(
				`Failed to attach audio consumer for ${participantId}:`,
				error,
			);
		}
	}

	async handleScreenShareConsumer(consumer) {
		const { participantId, track } = consumer;

		const allConsumers = this.consumerManager.getAllConsumers();
		const allCameraConsumers = allConsumers.filter(
			(c) => c.kind === "video" && !c.isScreen,
		);

		try {
			// Only re-attach camera consumers once when transitioning to screen share mode
			if (allCameraConsumers.length > 0 && !this.isScreenShareActive) {
				this.isScreenShareActive = true;

				// Re-attach ALL existing camera consumers since layout is switching to sidebar mode
				for (const cameraConsumer of allCameraConsumers) {
					await this.attachVideoConsumer(
						cameraConsumer.participantId,
						cameraConsumer,
					);
				}
			}

			const screenStream = new MediaStream([track]);
			if (consumer?.appData && !consumer.appData.type) {
				consumer.appData.type = "screen";
			} else if (consumer && !consumer.appData) {
				consumer.appData = { type: "screen" };
			}

			if (this.eventHandlers.onScreenShareStarted) {
				this.eventHandlers.onScreenShareStarted({
					participantId,
					stream: screenStream,
					consumer,
				});
			}
		} catch (error) {
			console.error("Failed to handle screen share consumer:", error);
		}
	}

	async flushBufferedProducers() {
		if (!this.bufferedProducerEvents.length) {
			console.log("No buffered producer events to flush");
			return;
		}

		console.log(
			`Flushing ${this.bufferedProducerEvents.length} buffered producer events`,
		);
		const pending = this.bufferedProducerEvents.splice(0);
		for (const event of pending) {
			try {
				if (!event?.producerId || !event.participantId) {
					console.warn("Skipping malformed buffered producer event:", event);
					continue;
				}

				// Check if we already have a consumer for this producer
				const existingConsumers =
					this.consumerManager.getConsumersByParticipant(event.participantId);
				const alreadySubscribed = existingConsumers.some((c) => {
					const consumerProducerId = c.consumer?.producerId || c.producerId;
					return consumerProducerId === event.producerId;
				});

				if (alreadySubscribed) {
					continue;
				}

				await this.subscribeToRemoteProducer({
					producerId: event.producerId,
					participantId: event.participantId,
					isScreen: event.isScreen,
				});
			} catch (error) {
				console.warn("Failed to process buffered producer:", error);
			}
		}
	}

	setupSFUEventHandlers() {
		this.sfuClient.on("reconnect", () => {
			this.recoverTransportIce("socket_reconnect");
		});

		this.sfuClient.on("participant_joined", (data) => {
			const currentUserId = this.getCurrentUserId();
			const joinedUserId = data.participantId || data.user_id;

			if (joinedUserId && joinedUserId !== currentUserId) {
				this.participantManager.addParticipant(data);
			}
		});

		this.sfuClient.on("participant_left", (data) => {
			this.participantManager.removeParticipant(data.participantId);
		});

		this.sfuClient.on("producer_created", async (data) => {
			if (data.participantId === this.getCurrentUserId()) return;

			// If we're syncing or the device isn't ready yet, buffer this event
			if (
				this.initialSyncInProgress ||
				!this.transportManager?.isDeviceLoaded?.()
			) {
				this.bufferedProducerEvents.push(data);
				return;
			}

			await this.subscribeToRemoteProducer({
				producerId: data.producerId,
				participantId: data.participantId,
				isScreen: data.isScreen,
			});
		});

		this.sfuClient.on("producer_closed", (data) => {
			const pid = data?.participantId;
			const closedProducerId = data?.producerId;
			const closedIsScreen = data?.isScreen;
			if (pid) {
				const allForPid = this.consumerManager.getConsumersByParticipant(pid);
				for (const c of allForPid) {
					const producedMatch =
						closedProducerId &&
						(c.consumer?.producerId === closedProducerId ||
							c.producerId === closedProducerId ||
							(c.appData && c.appData.producerId === closedProducerId));
					const isScreenLike =
						c.isScreen ||
						c.appData?.type === "screen" ||
						c.consumer?.appData?.type === "screen";
					// Only remove screen consumers if the closed producer was also screen
					const shouldRemove =
						producedMatch || (isScreenLike && closedIsScreen);
					if (shouldRemove) {
						this.consumerManager.removeConsumer(c.id);
						this.processedConsumers.delete(c.id);
					}
				}
			}

			if (this.eventHandlers && data?.isScreen) {
				this.eventHandlers.onScreenShareStopped({
					participantId: data?.participantId,
				});
			}
		});

		// When server explicitly notifies a consumer was closed, ensure local removal
		this.sfuClient.on("consumer_closed", (data) => {
			try {
				const consumerId = data?.consumerId;
				if (!consumerId) return;
				const removed = this.consumerManager.removeConsumer(consumerId);
				if (!removed) {
					// If not found by id, attempt to find by participant mapping if provided
					const pid = data?.participantId;
					if (pid) {
						const allForPid =
							this.consumerManager.getConsumersByParticipant(pid);
						for (const c of allForPid) {
							const maybeScreen =
								c.isScreen ||
								c.appData?.type === "screen" ||
								c.consumer?.appData?.type === "screen";
							if (maybeScreen) {
								this.consumerManager.removeConsumer(c.id);
							}
						}
					}
				}
			} catch (e) {
				console.warn("Error handling consumer_closed", e.message);
			}
		});

		this.sfuClient.on("media_control_update", (data) => {
			// Server sends { participantId, action } where action can be
			// - a string: 'mute'|'unmute'|'video_off'|'video_on'
			// - or an object: { type: 'audio'|'video', enabled: boolean }
			const updates = {};
			const action = data?.action;
			if (action && typeof action === "object") {
				if (action.type === "audio" && typeof action.enabled === "boolean") {
					updates.audioEnabled = !!action.enabled;
				}
				if (action.type === "video" && typeof action.enabled === "boolean") {
					updates.videoEnabled = !!action.enabled;
				}
			} else if (typeof action === "string") {
				switch (action) {
					case "mute":
						updates.audioEnabled = false;
						break;
					case "unmute":
						updates.audioEnabled = true;
						break;
					case "video_off":
						updates.videoEnabled = false;
						break;
					case "video_on":
						updates.videoEnabled = true;
						break;
					default:
						break;
				}
			}

			if (Object.keys(updates).length) {
				this.participantManager.updateMediaState(data.participantId, updates);
			}
		});

		this.sfuClient.on("network_quality_update", (data) => {
			if (data?.participantId && data?.quality) {
				this.participantManager.updateParticipant(data.participantId, {
					networkQuality: data.quality,
				});
			}
		});

		this.sfuClient.on("host_control_update", (data) => {
			const { action, targetParticipantId, hostId } = data;

			const myParticipantId = this.getCurrentUserId();

			console.log("SFU event: host_control_update", {
				action,
				targetParticipantId,
				hostId,
				myParticipantId,
			});

			// isForMe 👉👈?
			const isForMe = targetParticipantId === myParticipantId;

			switch (action) {
				case "mute_participant":
					if (isForMe) {
						if (this.eventHandlers.onHostMutedYou) {
							this.eventHandlers.onHostMutedYou();
						}
					} else {
						this.participantManager.updateMediaState(targetParticipantId, {
							audioEnabled: false,
						});
					}
					break;
				case "kick_participant":
					if (isForMe) {
						if (this.eventHandlers.onHostKickedYou) {
							this.eventHandlers.onHostKickedYou({ hostId });
						}
					}
					break;
				default:
					console.warn("Unknown host control action:", action);
			}
		});

		this.sfuClient.on("screen_share_started", (data) => {
			console.log("SFU event: screen_share_started (from signaling)", {
				participantId: data.participantId,
				hasDirectStream: !!data.stream,
			});
		});

		this.sfuClient.on("screen_share_stopped", (data) => {
			console.log("Screen share stopped - resetting sidebar mode flag");
			this.isScreenShareActive = false;

			if (this.eventHandlers.onScreenShareStopped) {
				this.eventHandlers.onScreenShareStopped(data);
			}

			const pid = data?.participantId;
			if (pid) {
				const screenConsumers = this.consumerManager
					.getScreenShareConsumers()
					.filter((c) => c.participantId === pid);
				for (const sc of screenConsumers) {
					console.log("Removing screen-share consumer on stop:", {
						consumerId: sc.id,
						participantId: pid,
					});
					this.consumerManager.removeConsumer(sc.id);
					this.processedConsumers.delete(sc.id);
				}
				// Safety scan across participant consumers for any with screen-like appData
				const allForPid = this.consumerManager.getConsumersByParticipant(pid);
				for (const c of allForPid) {
					const maybeScreen =
						c.isScreen ||
						c.appData?.type === "screen" ||
						c.consumer?.appData?.type === "screen";
					if (maybeScreen) {
						console.log("(safety) Removing screen-like consumer on stop:", {
							consumerId: c.id,
							participantId: pid,
						});
						this.consumerManager.removeConsumer(c.id);
						this.processedConsumers.delete(c.id);
					}
				}
			}
		});

		this.sfuClient.on("active_speaker", (data) => {
			if (this.eventHandlers.onActiveSpeakerChanged) {
				this.eventHandlers.onActiveSpeakerChanged(data.participantIds);
			}
		});
	}

	handleTransportConnectionStateChange(direction, state) {
		if (state === "failed" || state === "closed") {
			this.recoverTransportIce(`transport_${direction}_${state}`);
		}
	}

	async recoverTransportIce(reason) {
		if (this.recoveryInProgress) {
			return false;
		}

		if (!this.sfuClient?.isConnected?.()) {
			return false;
		}

		const now = Date.now();
		if (now - this.lastRecoveryAt < 7000) {
			return false;
		}

		this.recoveryInProgress = true;
		this.lastRecoveryAt = now;

		try {
			console.warn("Restarting SFU transport ICE", {
				reason,
				meetingId: this.meetingId,
			});

			const restarted = await this.transportManager.restartAllTransportIce();
			if (!restarted) {
				return false;
			}

			console.log("SFU transport ICE restart completed", { reason });
			return true;
		} catch (error) {
			console.error("SFU transport ICE restart failed:", error);
			return false;
		} finally {
			this.recoveryInProgress = false;
		}
	}

	registerVideoElement(participantId, element) {
		this.videoManager.registerVideoElement(participantId, element);
	}

	getVideoConsumerEntry(participantId) {
		return this.consumerManager.getVideoConsumer(participantId);
	}

	async updateConsumerStreamPreferences(consumerId, preferences) {
		if (!this.sfuClient?.isConnected()) {
			return null;
		}

		try {
			return await this.sfuClient.updateConsumerPreferences({
				consumerId,
				visible: preferences.visible,
				width: preferences.width,
				height: preferences.height,
			});
		} catch (error) {
			console.warn(
				"Failed to update consumer preferences",
				consumerId,
				error?.message || error,
			);
			return null;
		}
	}

	async disconnect() {
		try {
			this.recoveryInProgress = false;

			// Close producers/consumers and transports first
			this.consumerManager?.clear?.();
			this.mediaHandler?.cleanup?.();
			this.transportManager?.cleanup?.();
			if (this.sfuClient) {
				await this.sfuClient.disconnect();
			}
			this.isConnected = false;
		} catch (error) {
			console.error("Error disconnecting from SFU:", error);
		}
	}

	/**
	 * Clean up all resources
	 */
	cleanup() {
		this.mediaHandler.cleanup();
		this.videoManager.cleanup();
		this.participantManager.clear();
		this.consumerManager.clear();
		this.transportManager.cleanup();

		this.disconnect();

		this.meetingId = null;
		this.currentUser = { value: null };
		this.eventHandlers = {};
		this.isConnected = false;
		this.isSetupComplete = false;
		this.recoveryInProgress = false;
		this.lastRecoveryAt = 0;
	}

	/**
	 * Utility to ensure ref-like object
	 */
	ensureRef(obj) {
		if (obj && typeof obj === "object" && "value" in obj) {
			return obj;
		}
		return { value: obj };
	}

	getCurrentUserId() {
		const currentUser = this.currentUser?.value || this.currentUser;
		return currentUser?.user_id || currentUser?.userId || null;
	}
}

let sfuManagerInstance = null;

export function getSFUMeetingManager() {
	if (!sfuManagerInstance) {
		sfuManagerInstance = new SFUMeetingManager();
	}
	return sfuManagerInstance;
}

export function resetSFUMeetingManager() {
	if (sfuManagerInstance) {
		sfuManagerInstance.cleanup();
		sfuManagerInstance = null;
	}
}
