// @ts-nocheck
// Copyright (c) 2025, Frappe and contributors
// For license information, please see license.txt

// Ported from frappe/meet — adapter layer below replaces the
// frappe-ui dependency with a local fetch wrapper so the SFU client
// can be reused inside Raven (which uses frappe-react-sdk).
import { io } from "socket.io-client";

import { frappeRequest } from "./_frappeRequest";
import { normalizeCodecStrategy } from "./media/codecStrategy";

class SFUClient {
	constructor() {
		this.socket = null;
		this.connected = false;
		this.connectionDetails = {
			authToken: null,
			meetingId: null,
			userId: null,
			sfuUrl: null,
			sfuPort: null,
			tokenExpiresAt: null,
			codecStrategy: "svc",
		};
		this.eventHandlers = new Map();
		this.isRefreshingToken = false;
		this.tokenRefreshTimer = null;
		this.setupDefaultHandlers();
	}

	// ==================== CONNECTION MANAGEMENT ====================

	async connect(meetingId, guestAuthToken = null) {
		if (this.connected) {
			return true;
		}

		try {
			const connectionDetails = await this.getConnectionDetails(
				meetingId,
				guestAuthToken,
			);
			this.connectionDetails = connectionDetails;
			this.scheduleTokenRefresh();

			await this.establishSocketConnection();

			return true;
		} catch (error) {
			console.error("SFU connection failed:", error);
			throw error;
		}
	}

	async getConnectionDetails(meetingId, guestAuthToken = null) {
		let response;

		if (guestAuthToken) {
			const guestId = sessionStorage.getItem("guest_id");
			const guestName = sessionStorage.getItem("guest_name");
			const guestMeetingId = sessionStorage.getItem("guest_meeting_id");

			if (!guestId || guestMeetingId !== meetingId) {
				throw new Error("Guest session incomplete or invalid for this meeting");
			}

			try {
				response = await frappeRequest({
					url: "meet.api.meeting.get_guest_sfu_connection_details",
					params: {
						meeting_id: meetingId,
						guest_token: guestAuthToken,
					},
				});
			} catch (error) {
				console.error("Failed to get guest SFU connection details:", error);
				throw error;
			}

			return {
				authToken: guestAuthToken,
				meetingId: meetingId,
				userId: guestId,
				sfuUrl: response.sfu_url,
				sfuPort: response.sfu_port,
				userData: {
					name: guestName,
					is_guest: true,
				},
				tokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
				codecStrategy: response.codec_strategy || "svc",
			};
		}

		response = await frappeRequest({
			url: "meet.api.meeting.get_sfu_connection_details",
			params: { meeting_id: meetingId },
		});

		const {
			sfu_url,
			sfu_port,
			auth_token,
			user_id,
			meeting_id,
			user_data,
			expires_in,
			codec_strategy,
		} = response;

		const expiresInSeconds = typeof expires_in === "number" ? expires_in : 3600;
		const tokenExpiresAt = Date.now() + expiresInSeconds * 1000;

		return {
			authToken: auth_token,
			meetingId: meeting_id,
			userId: user_id,
			sfuUrl: sfu_url,
			sfuPort: sfu_port,
			userData: user_data,
			tokenExpiresAt,
			codecStrategy: normalizeCodecStrategy(codec_strategy),
		};
	}

	async getSFUEndpoint() {
		const { sfuUrl, sfuPort } = this.connectionDetails;

		let sfuEndpoint;
		const urlObj = new URL(sfuUrl);
		const isSecured = urlObj.protocol === "https:";

		if (isSecured) {
			sfuEndpoint = urlObj.origin;
		} else {
			sfuEndpoint = `${urlObj.protocol}//${urlObj.hostname}:${sfuPort}`;
		}

		return sfuEndpoint;
	}

	async establishSocketConnection() {
		const sfuEndpoint = await this.getSFUEndpoint();
		const { authToken } = this.connectionDetails;

		this.socket = io(sfuEndpoint, {
			auth: { token: authToken },
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			upgrade: true,
			reconnectionDelayMax: 5000,
			transports: ["websocket", "polling"],
			timeout: 20000,
			forceNew: true,
			withCredentials: false,
		});

		this.registerEventHandlers();

		return new Promise((resolve, reject) => {
			this.socket.on("connect", () => {
				this.connected = true;
				resolve();
			});

			this.socket.on("connect_error", (error) => {
				console.error("Socket connection failed:", {
					message: error.message,
					description: error.description,
					context: error.context,
					type: error.type,
					endpoint: sfuEndpoint,
				});
				this.connected = false;
				reject(new Error(`SFU connection failed: ${error.message || error}`));
			});

			this.socket.on("disconnect", () => {
				this.connected = false;
			});

			this.socket.on("reconnect_attempt", async (_attemptNumber) => {
				if (this.isTokenExpiringSoon()) {
					try {
						const newToken = await this.refreshToken({
							skipServerUpdate: true,
						});
						this.socket.auth.token = newToken;
						console.log("Updated socket auth token for reconnection");
					} catch (error) {
						console.error(
							"Failed to refresh token during reconnection:",
							error,
						);
					}
				}
			});

			this.socket.on("reconnect", (attemptNumber) => {
				console.log(`SFU reconnected after ${attemptNumber} attempts`);
				this.connected = true;
			});

			this.socket.on("reconnect_error", (error) => {
				console.error("SFU reconnection failed:", error);
			});

			setTimeout(() => {
				if (!this.connected) {
					console.error("SFU connection timeout after 10 seconds");
					reject(new Error("SFU connection timeout"));
				}
			}, 10000);
		});
	}

	disconnect() {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
		this.clearTokenRefreshTimer();
		this.connected = false;
		this.connectionDetails = {
			authToken: null,
			meetingId: null,
			userId: null,
			sfuUrl: null,
			sfuPort: null,
			tokenExpiresAt: null,
			codecStrategy: "svc",
		};
		this.isRefreshingToken = false;
	}

	// ==================== TOKEN MANAGEMENT ====================

	clearTokenRefreshTimer() {
		if (this.tokenRefreshTimer) {
			clearTimeout(this.tokenRefreshTimer);
			this.tokenRefreshTimer = null;
		}
	}

	scheduleTokenRefresh(bufferMs = 5 * 60 * 1000) {
		// 5 minutes before expiry
		this.clearTokenRefreshTimer();

		const { tokenExpiresAt, meetingId } = this.connectionDetails;

		if (!tokenExpiresAt || !meetingId) {
			return;
		}

		const delay = tokenExpiresAt - Date.now() - bufferMs;

		if (delay <= 0) {
			this.refreshToken().catch((error) => {
				console.error("Immediate token refresh failed:", error);
			});
			return;
		}

		this.tokenRefreshTimer = setTimeout(async () => {
			try {
				await this.refreshToken();
			} catch (error) {
				console.error("Scheduled token refresh failed:", error);
			}
		}, delay);
	}

	async refreshToken(options = {}) {
		const { skipServerUpdate = false } = options;
		if (this.isRefreshingToken) {
			return;
		}

		try {
			this.isRefreshingToken = true;

			const response = await frappeRequest({
				url: "meet.api.meeting.refresh_sfu_token",
				params: { meeting_id: this.connectionDetails.meetingId },
			});

			const expiresInSeconds =
				typeof response.expires_in === "number" ? response.expires_in : 3600;

			this.connectionDetails.authToken = response.auth_token;
			this.connectionDetails.tokenExpiresAt =
				Date.now() + expiresInSeconds * 1000;
			this.connectionDetails.codecStrategy = normalizeCodecStrategy(
				response.codec_strategy || this.connectionDetails.codecStrategy,
			);

			if (this.socket) {
				this.socket.auth = this.socket.auth || {};
				this.socket.auth.token = response.auth_token;

				if (this.socket.io?.opts) {
					this.socket.io.opts.auth = {
						...(this.socket.io.opts.auth || {}),
						token: response.auth_token,
					};
				}
			}

			if (!skipServerUpdate && this.connected) {
				await this.sendRequest("auth:update_token", {
					token: response.auth_token,
				});
			} else {
				if (!this.connected) {
					console.log(
						"Skipping server token sync because socket is disconnected",
					);
				}
			}

			this.scheduleTokenRefresh();

			return response.auth_token;
		} catch (error) {
			console.error("Token refresh failed:", error);
			throw error;
		} finally {
			this.isRefreshingToken = false;
		}
	}

	isTokenExpiringSoon() {
		const { tokenExpiresAt, authToken } = this.connectionDetails;

		if (tokenExpiresAt) {
			return tokenExpiresAt - Date.now() < 5 * 60 * 1000; // 5 minutes
		}

		if (!authToken) {
			return false;
		}

		try {
			const payload = JSON.parse(atob(authToken.split(".")[1]));
			const expiryTime = payload.exp * 1000;
			const timeUntilExpiry = expiryTime - Date.now();

			return timeUntilExpiry < 5 * 60 * 1000;
		} catch (error) {
			console.warn("Could not check token expiry:", error);
			return false;
		}
	}

	// ==================== EVENT HANDLING ====================

	setupDefaultHandlers() {
		const defaultHandlers = {
			connect: () => {
				this.connected = true;
			},
			disconnect: () => {
				this.connected = false;
			},
			connect_error: (error) => {
				console.error("SFU connection error:", error);
				this.connected = false;
			},
			reconnect: (attemptNumber) => {
				console.log(`SFU reconnected after ${attemptNumber} attempts`);
				this.connected = true;
			},
			reconnect_error: (error) => {
				console.error("SFU reconnection failed:", error);
			},
			participant_joined: () => {},
			participant_left: () => {},
			producer_created: () => {},
			producer_closed: () => {},
			consumer_created: () => {},
			consumer_closed: () => {},
			media_control_update: () => {},
			host_control_update: () => {},
			screen_share_started: () => {},
			screen_share_stopped: () => {},
			webrtc_offer: () => {},
			webrtc_answer: () => {},
			ice_candidate: () => {},
			"chat:message": () => {},
			active_speaker: () => {},
			hand_raised: () => {},
			existing_raised_hands: () => {},
		};

		for (const [event, handler] of Object.entries(defaultHandlers)) {
			this.eventHandlers.set(event, handler);
		}
	}

	registerEventHandlers() {
		if (!this.socket) return;

		for (const [event, handler] of this.eventHandlers.entries()) {
			this.socket.on(event, handler);
		}
	}

	on(event, handler) {
		this.eventHandlers.set(event, handler);
		if (this.socket) {
			this.socket.on(event, handler);
		}
	}

	off(event) {
		const handler = this.eventHandlers.get(event);
		if (handler && this.socket) {
			this.socket.off(event, handler);
		}
		this.eventHandlers.delete(event);
	}

	// ==================== WEBRTC OPERATIONS ====================

	async getRouterRtpCapabilities() {
		const resp = await this.sendRequest("get_router_rtp_capabilities", {});
		try {
			const payload = resp?.rtpCapabilities || resp;
			return JSON.parse(JSON.stringify(payload));
		} catch (err) {
			console.warn("Failed to deep-clone router RTP capabilities:", err);
			return resp?.rtpCapabilities || resp;
		}
	}

	async createWebRtcTransport(direction) {
		const response = await this.sendRequest("create_webrtc_transport", {
			direction,
		});
		try {
			const clean = JSON.parse(JSON.stringify(response));
			const { id, iceParameters, iceCandidates, dtlsParameters } = clean;
			return { id, iceParameters, iceCandidates, dtlsParameters };
		} catch (err) {
			console.warn(
				"Failed to deep-clone transport response, returning raw response",
				err,
			);
			const { id, iceParameters, iceCandidates, dtlsParameters } = response;
			return { id, iceParameters, iceCandidates, dtlsParameters };
		}
	}

	async connectWebRtcTransport(transportId, dtlsParameters) {
		console.log(`Connecting transport ${transportId} to SFU...`);
		console.log("DTLS Parameters:", dtlsParameters);

		await this.sendRequest("connect_webrtc_transport", {
			transportId,
			dtlsParameters,
		});

		console.log(`Transport ${transportId} connected successfully`);
	}

	async restartWebRtcTransportIce(transportId) {
		const response = await this.sendRequest("restart_webrtc_transport_ice", {
			transportId,
		});
		return response.iceParameters;
	}

	async createProducer(transportId, rtpParameters, kind, appData = {}) {
		return this.sendRequest("create_producer", {
			transportId,
			rtpParameters,
			kind,
			appData,
		});
	}

	async createConsumer(transportId, producerId, rtpCapabilities) {
		console.log(`Creating consumer for producer ${producerId} @ ${Date.now()}`);
		return this.sendRequest("create_consumer", {
			transportId,
			producerId,
			rtpCapabilities,
		});
	}

	async closeProducer(producerId) {
		return this.sendRequest("close_producer", { producerId });
	}

	async closeConsumer(consumerId) {
		return this.sendRequest("close_consumer", { consumerId });
	}

	async updateConsumerPreferences({ consumerId, visible, width, height }) {
		return this.sendRequest("consumer:update_preferences", {
			consumerId,
			visible: Boolean(visible),
			width: Math.round(width),
			height: Math.round(height),
		});
	}

	// ==================== ROOM OPERATIONS ====================

	async getExistingProducers(roomId = null) {
		const requestData = roomId ? { roomId } : {};
		const response = await this.sendRequest(
			"get_existing_producers",
			requestData,
		);
		return response.producers;
	}

	async getRoomParticipants() {
		const response = await this.sendRequest("get_room_participants", {});
		return response.participants;
	}

	// ==================== ROOM MANAGEMENT ====================

	async joinRoom(roomId, userData, mediaState) {
		return this.sendRequest("join_room", {
			roomId,
			userData,
			mediaState,
		});
	}

	// ==================== SIGNALING OPERATIONS ====================

	sendWebRtcOffer(targetUser, signalData) {
		this.sendEvent("webrtc_offer", { targetUser, signalData });
	}

	sendWebRtcAnswer(targetUser, signalData) {
		this.sendEvent("webrtc_answer", { targetUser, signalData });
	}

	sendIceCandidate(targetUser, signalData) {
		this.sendEvent("ice_candidate", { targetUser, signalData });
	}

	// ==================== MEDIA CONTROL ====================

	sendMediaControl(action) {
		this.sendEvent("media_control", { action });
	}

	sendScreenShare(action, shareData = {}) {
		this.sendEvent("screen_share", { action, shareData });
	}

	// ==================== CHAT OPERATIONS ====================

	sendChatMessage(message, options = {}) {
		if (!this.connected) {
			throw new Error("Not connected to SFU");
		}

		const payload = { message: String(message || "") };
		if (options.clientId) {
			payload.clientId = String(options.clientId);
		}

		this.sendEvent("chat:send", payload);
	}

	// ==================== REACTION OPERATIONS ====================

	sendReaction(reactionType) {
		if (!this.connected) {
			throw new Error("Not connected to SFU");
		}

		this.sendEvent("reaction:send", { reaction: reactionType });
	}

	sendRaiseHand(raised) {
		if (!this.connected) {
			throw new Error("Not connected to SFU");
		}

		return new Promise((resolve, reject) => {
			this.socket.emit("raise_hand", { raised }, (response) => {
				if (response?.success) {
					resolve(response);
				} else {
					reject(new Error(response?.error || "Failed to raise hand"));
				}
			});
		});
	}

	// ==================== UTILITY METHODS ====================

	async sendRequest(event, data) {
		return new Promise((resolve, reject) => {
			if (!this.connected) {
				reject(new Error("Not connected to SFU"));
				return;
			}

			this.socket.emit(event, data, (response) => {
				if (response.success) {
					resolve(response);
				} else {
					const error = new Error(response.error || `Request failed: ${event}`);
					console.error(`SFU request failed (${event}):`, response.error);
					reject(error);
				}
			});
		});
	}

	sendEvent(event, data) {
		if (!this.connected) {
			throw new Error("Not connected to SFU");
		}
		this.socket.emit(event, data);
	}

	isConnected() {
		return this.connected;
	}

	getMeetingId() {
		return this.connectionDetails.meetingId;
	}

	getUserId() {
		return this.connectionDetails.userId;
	}

	getCodecStrategy() {
		return this.connectionDetails.codecStrategy || "svc";
	}

	getConnectionStatus() {
		return {
			connected: this.connected,
			meetingId: this.connectionDetails.meetingId,
			userId: this.connectionDetails.userId,
			socketId: this.socket?.id || null,
		};
	}
}

let sfuClient = null;

export function getSFUClient() {
	if (!sfuClient) {
		sfuClient = new SFUClient();
	}
	return sfuClient;
}
