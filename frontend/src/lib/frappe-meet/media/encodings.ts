// @ts-nocheck
// layers for simulcast video streaming (adaptive streaming)
// layer 0: low quality (200 kbps)
// layer 1: medium quality (400 kbps)
// layer 2: high quality (1000 kbps)
export const videoEncodings = [
	{ maxBitrate: 200000, scaleResolutionDownBy: 2 },
	{ maxBitrate: 400000, scaleResolutionDownBy: 1 },
	{ maxBitrate: 1000000 },
];

export const svcEncodingTemplate = (scalabilityMode = "L3T1") => [
	{
		scalabilityMode,
		maxBitrate: scalabilityMode?.startsWith("L3")
			? 1000000
			: scalabilityMode?.startsWith("L2")
				? 700000
				: 500000,
	},
];

// no adaptive streaming for screensharing
// as we don't reduce resolution for screenshare
// and fps is handled by the hint in the browser in case of congestion control
export const screenEncodings = [{ maxBitrate: 2000000 }];

export const videoCodecOptions = {
	videoGoogleStartBitrate: 2000,
};

export const audioCodecOptions = {
	// ref: https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
	opusStereo: 0, // disable stereo to save bandwidth, as most meetings are voice-only
	opusDtx: 1, // enable DTX to save bandwidth during silence periods
	opusFec: 1, // enable FEC to improve audio quality in case of packet loss
	opusMaxAverageBitrate: 48000,
};
