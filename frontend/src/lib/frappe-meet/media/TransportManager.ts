/**
 * Transport Manager
 * Handles mediasoup-client Device and Transport management
 */

import { getSFUClient } from "../sfu-client";
import { resolveCodecStrategy } from "./codecStrategy";
import {
	audioCodecOptions,
	screenEncodings,
	svcEncodingTemplate,
	videoCodecOptions,
	videoEncodings,
} from "./encodings";

type Direction = "send" | "recv";

type TransportStatReport = {
	type?: string;
	state?: string;
	currentRoundTripTime?: number;
	availableOutgoingBitrate?: number;
	packetsReceived?: number;
	packetsLost?: number;
	roundTripTime?: number;
};

type TransportConnectionState =
	| "new"
	| "connecting"
	| "connected"
	| "failed"
	| "disconnected"
	| "closed"
	| string;

type TransportStateHandler = (payload: {
	direction: Direction;
	state: TransportConnectionState;
}) => void;

type EventHandlers = {
	onTransportConnectionStateChange?: TransportStateHandler;
};

type ProducerLike = {
	id: string;
};

type ConsumerLike = {
	id: string;
};

type WebRtcTransportParams = {
	id: string;
	iceParameters: unknown;
	iceCandidates: unknown;
	dtlsParameters: unknown;
};

type ConsumerParams = {
	id: string;
	producerId: string;
	kind: string;
	rtpParameters: unknown;
	isScreen?: boolean;
	appData?: {
		type?: string;
	};
};

type RouterCapabilities = {
	codecs?: Array<{
		mimeType?: string;
		mime_type?: string;
		scalabilityModes?: string[];
	}>;
} | null;

type TransportLike = {
	id: string;
	connectionState: TransportConnectionState;
	on: <TArgs extends unknown[]>(
		event: string,
		handler: (...args: TArgs) => void,
	) => void;
	close: () => void;
	restartIce: (args: { iceParameters: unknown }) => Promise<void>;
	produce?: (options: Record<string, unknown>) => Promise<ProducerLike>;
	consume?: (args: Record<string, unknown>) => Promise<ConsumerLike>;
	getStats: () => Promise<Map<string, TransportStatReport>>;
};

type DeviceLike = {
	loaded?: boolean;
	rtpCapabilities?: {
		codecs?: Array<{ mimeType: string }>;
	};
	load: (args: { routerRtpCapabilities: unknown }) => Promise<void>;
	canProduce: (kind: string) => boolean;
	createSendTransport: (args: Record<string, unknown>) => TransportLike;
	createRecvTransport: (args: Record<string, unknown>) => TransportLike;
};

type SFUClientLike = {
	getCodecStrategy?: () => string;
	getRouterRtpCapabilities: () => Promise<unknown>;
	createWebRtcTransport: (
		direction: Direction,
	) => Promise<WebRtcTransportParams>;
	connectWebRtcTransport: (
		transportId: string,
		dtlsParameters: unknown,
	) => Promise<void>;
	createProducer: (
		transportId: string,
		rtpParameters: unknown,
		kind: string,
		appData: unknown,
	) => Promise<{ id: string }>;
	createConsumer: (
		transportId: string,
		producerId: string,
		rtpCapabilities: unknown,
	) => Promise<ConsumerParams>;
	restartWebRtcTransportIce: (transportId: string) => Promise<unknown>;
};

export class TransportManager {
	sendTransport: TransportLike | null;
	recvTransport: TransportLike | null;
	device: DeviceLike | null;
	sfuClient: SFUClientLike | null;
	routerRtpCapabilities: RouterCapabilities;
	activeVideoStrategy: string;
	eventHandlers: EventHandlers;

	constructor() {
		this.sendTransport = null;
		this.recvTransport = null;
		this.device = null;
		this.sfuClient = null;
		this.routerRtpCapabilities = null;
		this.activeVideoStrategy = "svc";
		this.eventHandlers = {};
	}

	setEventHandlers(handlers: EventHandlers = {}) {
		this.eventHandlers = { ...this.eventHandlers, ...handlers };
	}

	emitTransportConnectionState(
		direction: Direction,
		state: TransportConnectionState,
	) {
		if (
			typeof this.eventHandlers.onTransportConnectionStateChange === "function"
		) {
			this.eventHandlers.onTransportConnectionStateChange({ direction, state });
		}
	}

	getVideoEncodingDecision() {
		const preference = this.sfuClient?.getCodecStrategy?.() || "svc";
		return resolveCodecStrategy({
			preference,
			deviceCapabilities: this.device?.rtpCapabilities,
			routerCapabilities: this.routerRtpCapabilities,
		});
	}

	getVideoEncodingConfig(source: "camera" | "screen" = "camera") {
		const decision = this.getVideoEncodingDecision();
		const isScreen = source === "screen";

		// no adaptive streaming for screensharing
		// as we don't reduce resolution for screenshare
		// and fps is handled by the hint in the browser in case of congestion control
		const strategy = isScreen ? "single" : decision.strategy;
		const scalabilityMode =
			strategy === "svc" ? decision.scalabilityMode : null;

		return {
			decision: {
				...decision,
				strategy,
				scalabilityMode,
			},
			encodings:
				strategy === "svc"
					? svcEncodingTemplate(scalabilityMode ?? undefined)
					: isScreen
						? screenEncodings
						: videoEncodings,
		};
	}

	initialize(sfuClient?: SFUClientLike) {
		this.sfuClient = sfuClient || (getSFUClient() as SFUClientLike);
	}

	private getClient(): SFUClientLike {
		if (!this.sfuClient) throw new Error("SFU client is not initialized");
		return this.sfuClient;
	}

	private extractRouterRtpCapabilities(response: unknown): RouterCapabilities {
		if (
			typeof response === "object" &&
			response !== null &&
			"rtpCapabilities" in response
		) {
			return (response as { rtpCapabilities: RouterCapabilities })
				.rtpCapabilities;
		}
		return response as RouterCapabilities;
	}

	async initializeDevice() {
		if (this.device) return this.device;
		const { Device } = await import("mediasoup-client");
		const client = this.getClient();
		this.device = new Device() as unknown as DeviceLike;
		const routerCapsResp = await client.getRouterRtpCapabilities();
		const routerRtpCapabilities =
			this.extractRouterRtpCapabilities(routerCapsResp);
		this.routerRtpCapabilities = routerRtpCapabilities;

		await this.device.load({ routerRtpCapabilities });

		return this.device;
	}

	async createSendTransport() {
		if (this.sendTransport) return this.sendTransport;
		if (!this.device) await this.initializeDevice();
		if (!this.device) throw new Error("Device failed to initialize");
		const client = this.getClient();
		const rawTransportParams = await client.createWebRtcTransport("send");

		this.sendTransport = this.device.createSendTransport({
			id: rawTransportParams.id,
			iceParameters: rawTransportParams.iceParameters,
			iceCandidates: rawTransportParams.iceCandidates,
			dtlsParameters: rawTransportParams.dtlsParameters,
		});
		this.setupSendTransportHandlers();

		return this.sendTransport;
	}

	setupSendTransportHandlers() {
		if (!this.sendTransport) return;
		const client = this.getClient();
		const sendTransport: TransportLike = this.sendTransport;
		const sendTransportId = sendTransport.id;
		sendTransport.on(
			"connect",
			async (
				{ dtlsParameters }: { dtlsParameters: unknown },
				callback: () => void,
				errback: (error: unknown) => void,
			) => {
				try {
					await client.connectWebRtcTransport(sendTransportId, dtlsParameters);
					callback();
				} catch (error) {
					errback(error);
				}
			},
		);

		sendTransport.on("produce", async (...args: unknown[]) => {
			const [parameters, callback, errback] = args as [
				{ rtpParameters: unknown; kind: string; appData: unknown },
				(result: { id: string }) => void,
				(error: unknown) => void,
			];
			if (!parameters || typeof callback !== "function") return;

			try {
				const response = await client.createProducer(
					sendTransportId,
					parameters.rtpParameters,
					parameters.kind,
					parameters.appData,
				);
				callback({ id: response.id });
			} catch (error) {
				errback(error);
			}
		});

		sendTransport.on("connectionstatechange", (state: unknown) => {
			if (state === "failed") {
				console.error("Send transport failed");
			}
			this.emitTransportConnectionState("send", String(state));
		});
	}

	async createReceiveTransport() {
		if (this.recvTransport) return this.recvTransport;
		if (!this.device) await this.initializeDevice();
		if (!this.device) throw new Error("Device failed to initialize");
		const client = this.getClient();
		const rawTransportParams = await client.createWebRtcTransport("recv");

		this.recvTransport = this.device.createRecvTransport({
			id: rawTransportParams.id,
			iceParameters: rawTransportParams.iceParameters,
			iceCandidates: rawTransportParams.iceCandidates,
			dtlsParameters: rawTransportParams.dtlsParameters,
		});
		this.setupReceiveTransportHandlers();
		return this.recvTransport;
	}

	setupReceiveTransportHandlers() {
		if (!this.recvTransport) return;
		const client = this.getClient();
		const recvTransport: TransportLike = this.recvTransport;
		recvTransport.on(
			"connect",
			async (
				{ dtlsParameters }: { dtlsParameters: unknown },
				callback: () => void,
				errback: (error: unknown) => void,
			) => {
				try {
					await client.connectWebRtcTransport(recvTransport.id, dtlsParameters);
					callback();
				} catch (error) {
					errback(error);
				}
			},
		);

		recvTransport.on("connectionstatechange", (state: unknown) => {
			if (state === "failed") {
				console.error("Receive transport failed");
			}
			this.emitTransportConnectionState("recv", String(state));
		});
	}

	async restartTransportIce(direction: Direction) {
		const transport =
			direction === "send" ? this.sendTransport : this.recvTransport;
		if (!transport || !this.sfuClient) {
			return false;
		}

		const iceParameters = await this.sfuClient.restartWebRtcTransportIce(
			transport.id,
		);
		await transport.restartIce({ iceParameters });
		return true;
	}

	async restartAllTransportIce() {
		const results = await Promise.allSettled([
			this.restartTransportIce("send"),
			this.restartTransportIce("recv"),
		]);

		return results.some(
			(result) => result.status === "fulfilled" && result.value === true,
		);
	}

	async createProducer(
		track: MediaStreamTrack,
		appData: Record<string, unknown> = {},
	) {
		if (!this.sendTransport) await this.createSendTransport();
		if (!this.device?.canProduce?.(track?.kind || "video"))
			throw new Error("Unsupported");
		if (!this.sendTransport?.produce)
			throw new Error("Send transport is not ready to produce");

		const safeAppData = { type: "camera", ...(appData || {}) };
		console.log("createProducer called", {
			trackId: track?.id,
			trackKind: track?.kind,
			trackReadyState: track?.readyState,
			appData: safeAppData,
		});

		const produceOptions: Record<string, unknown> = {
			track,
			appData: safeAppData,
		};

		if (track?.kind === "video") {
			const source = safeAppData.type === "screen" ? "screen" : "camera";
			const encodingConfig = this.getVideoEncodingConfig(source);
			this.activeVideoStrategy = encodingConfig.decision.strategy;

			console.info("Video encoding decision", {
				strategy: encodingConfig.decision.strategy,
				scalabilityMode: encodingConfig.decision.scalabilityMode,
			});

			produceOptions.encodings = encodingConfig.encodings;
			if (encodingConfig.decision.strategy === "svc") {
				const vp9Codec = this.device?.rtpCapabilities?.codecs?.find((codec) =>
					codec.mimeType.toLowerCase().includes("vp9"),
				);
				if (vp9Codec) {
					produceOptions.codec = vp9Codec;
				}
			}
			if (safeAppData.type === "screen" && "contentHint" in track) {
				track.contentHint = "detail";
			}
			produceOptions.codecOptions = videoCodecOptions;
			produceOptions.appData = {
				...safeAppData,
				codecStrategy: encodingConfig.decision.strategy,
				scalabilityMode: encodingConfig.decision.scalabilityMode,
			};
		}

		if (track?.kind === "audio") {
			produceOptions.codecOptions = audioCodecOptions;
		}

		const producer = await this.sendTransport.produce(produceOptions);

		if (safeAppData.type === "screen") {
			const sender = (producer as { rtpSender?: RTCRtpSender }).rtpSender;
			if (sender?.getParameters && sender?.setParameters) {
				try {
					const parameters = sender.getParameters() || {};
					if (parameters.degradationPreference !== "maintain-resolution") {
						await sender.setParameters({
							...parameters,
							degradationPreference: "maintain-resolution",
						});
					}
				} catch (error) {
					console.warn(
						"Failed to apply screen share sender preferences",
						error,
					);
				}
			}
		}

		return producer;
	}

	async createConsumer(
		producerId: string,
		metadata: Record<string, unknown> = {},
	) {
		if (!this.device) await this.initializeDevice();
		if (!this.recvTransport) await this.createReceiveTransport();
		if (!this.device || !this.recvTransport)
			throw new Error("Consumer transport is not initialized");
		const client = this.getClient();
		const recvTransport = this.recvTransport;
		const device = this.device;
		if (!recvTransport.consume)
			throw new Error("Receive transport is not ready to consume");

		const rawConsumerParams = await client.createConsumer(
			recvTransport.id,
			producerId,
			device.rtpCapabilities,
		);

		const isScreen = !!(
			metadata.isScreen ||
			rawConsumerParams.isScreen ||
			rawConsumerParams?.appData?.type === "screen"
		);

		let consumer: ConsumerLike | null = null;
		let firstError: unknown = null;
		try {
			const consumeArgs = {
				id: rawConsumerParams.id,
				producerId: rawConsumerParams.producerId,
				kind: rawConsumerParams.kind,
				rtpParameters: rawConsumerParams.rtpParameters,
				...(isScreen ? { appData: { type: "screen" } } : {}),
			};
			consumer = await recvTransport.consume(consumeArgs);
		} catch (err) {
			firstError = err;
			throw err;
		}

		if (!consumer && firstError) throw firstError;
		if (isScreen && consumer)
			console.info("Screen share consumer created", {
				consumerId: consumer.id,
			});
		return consumer;
	}

	getDeviceCapabilities() {
		return this.device?.rtpCapabilities || null;
	}

	isDeviceLoaded() {
		return this.device?.loaded || false;
	}

	getTransportStats() {
		return {
			sendTransport: {
				id: this.sendTransport?.id || null,
				state: this.sendTransport?.connectionState || "closed",
			},
			recvTransport: {
				id: this.recvTransport?.id || null,
				state: this.recvTransport?.connectionState || "closed",
			},
		};
	}

	async getNetworkStats() {
		const result = {
			rtt: 0,
			packetLoss: 0,
			availableOutgoingBitrate: 0,
			timestamp: Date.now(),
			isValid: false,
		};

		if (!this.sendTransport && !this.recvTransport) {
			return result;
		}

		try {
			let totalRtt = 0;
			let rttCount = 0;
			let packetsSent = 0;
			let packetsLost = 0;
			let validStatsFound = false;

			const processStats = (stats: Map<string, TransportStatReport>) => {
				for (const report of stats.values()) {
					// Check RTT from candidate pairs
					if (
						report.type === "candidate-pair" &&
						report.state === "succeeded"
					) {
						if (report.currentRoundTripTime !== undefined) {
							// Convert exact seconds to ms
							totalRtt += report.currentRoundTripTime * 1000;
							rttCount++;
							if (report.availableOutgoingBitrate) {
								result.availableOutgoingBitrate =
									report.availableOutgoingBitrate;
							}
						}
					}

					// Outbound RTP (local sending): check fraction lost from RTCP (remote-inbound-rtp usually, or inside outbound-rtp in some browsers)
					if (report.type === "outbound-rtp") {
						validStatsFound = true;
						// Some browsers may put it directly here or in a linked remote-inbound-rtp
					}

					// Inbound RTP (local receiving): we can calculate packet loss we are seeing
					if (report.type === "inbound-rtp") {
						validStatsFound = true;
						if (
							report.packetsReceived !== undefined &&
							report.packetsLost !== undefined
						) {
							packetsSent += report.packetsReceived + report.packetsLost;
							packetsLost += report.packetsLost;
						}
					}

					// Remote Inbound RTP (remote receiving our media): tells us about the uplink loss
					if (report.type === "remote-inbound-rtp") {
						if (report.roundTripTime !== undefined) {
							// Note: this is typically per-stream RTT
							totalRtt += report.roundTripTime * 1000;
							rttCount++;
						}
					}
				}
			};

			if (
				this.sendTransport &&
				(this.sendTransport.connectionState === "connected" ||
					this.sendTransport.connectionState === "completed")
			) {
				const sendStats = await this.sendTransport.getStats();
				processStats(sendStats);
			}

			if (
				this.recvTransport &&
				(this.recvTransport.connectionState === "connected" ||
					this.recvTransport.connectionState === "completed")
			) {
				const recvStats = await this.recvTransport.getStats();
				processStats(recvStats);
			}

			if (rttCount > 0) {
				result.rtt = totalRtt / rttCount;
				validStatsFound = true;
			}

			if (packetsSent > 0) {
				result.packetLoss = (packetsLost / packetsSent) * 100; // Percentage 0-100
			}

			result.isValid = validStatsFound;
			return result;
		} catch (error) {
			console.warn("Failed to get transport network stats", error);
			return result;
		}
	}

	cleanup() {
		if (this.sendTransport)
			try {
				this.sendTransport.close();
			} catch (_e) {
				/* ignore */
			}
		if (this.recvTransport)
			try {
				this.recvTransport.close();
			} catch (_e) {
				/* ignore */
			}
		this.sendTransport = null;
		this.recvTransport = null;
		this.device = null;
	}
}
