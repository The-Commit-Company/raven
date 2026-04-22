type RtpCodec = {
	mimeType?: string;
	mime_type?: string;
	scalabilityModes?: string[];
};
type DeviceCapabilities = { codecs?: RtpCodec[] } | null;
type RouterCapabilities = { codecs?: RtpCodec[] } | null;

type CodecDecision = {
	strategy: "svc" | "simulcast";
	scalabilityMode: string | null;
	didDowngrade: boolean;
	requested: string;
};

const VALID_STRATEGIES = new Set(["svc", "simulcast"]);
// multi-spatial single-temporal modes (L3T1/L2T1/L1T1).
const PREFERRED_SVC_MODES = ["L3T1_KEY", "L3T1", "L2T1", "L2T1_KEY", "L1T1"];

type SupportInfo = {
	supportsVP9: boolean;
	supportsSVC: boolean;
	availableScalabilityModes: string[];
};

// cache is used to avoid multiple calls to getCapabilities
const cache: { support: SupportInfo | null; cachedAt: number } = {
	support: null,
	cachedAt: 0,
};

function nowMs() {
	return Date.now();
}

export function normalizeCodecStrategy(value: string): string {
	const normalized = value.trim().toLowerCase() || "svc";
	return VALID_STRATEGIES.has(normalized) ? normalized : "svc";
}

function detectBrowserSupport() {
	const MAX_CACHE_MS = 60 * 1000;
	if (cache.support && nowMs() - cache.cachedAt < MAX_CACHE_MS)
		return cache.support;

	const result: {
		supportsVP9: boolean;
		supportsSVC: boolean;
		availableScalabilityModes: string[];
	} = { supportsVP9: false, supportsSVC: false, availableScalabilityModes: [] };

	try {
		const senderCaps = RTCRtpSender.getCapabilities("video");

		type SenderCaps = { codecs?: RtpCodec[] } | null;
		const caps = (senderCaps as SenderCaps) || null;
		const senderCodecs = Array.isArray(caps?.codecs) ? caps.codecs : [];
		const vp9Codec = senderCodecs.find((codec) => {
			const mime = codec?.mimeType || codec?.mime_type || "";
			return mime.toLowerCase().includes("vp9");
		});

		if (vp9Codec) {
			result.supportsVP9 = true;
			if (Array.isArray(vp9Codec.scalabilityModes)) {
				result.availableScalabilityModes = vp9Codec.scalabilityModes.filter(
					(m) => m.length > 0,
				) as string[];
				if (result.availableScalabilityModes.length > 0)
					result.supportsSVC = true;
			}
		}

		// Firefox has partial support for VP9 SVC (only temporal layer)
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1633876

		if (!result.supportsSVC && result.supportsVP9) {
			// Some Chromium builds omit scalabilityModes but still support SVC.
			const ua = navigator.userAgent || "";
			const isChromiumLike =
				/Chrome\//.test(ua) || /Chromium/.test(ua) || /Edg\//.test(ua);
			result.supportsSVC = isChromiumLike;
		}
	} catch (error) {
		console.warn("Failed to detect VP9 SVC capabilities:", error);
	}

	cache.support = result;
	cache.cachedAt = nowMs();
	return result;
}

function routerSupportsVP9(deviceCapabilities: DeviceCapabilities): boolean {
	const codecs = Array.isArray(deviceCapabilities?.codecs)
		? deviceCapabilities.codecs
		: [];
	return codecs.some((codec) => {
		const mime = codec?.mimeType || codec?.mime_type;
		return typeof mime === "string" && mime.toLowerCase().includes("vp9");
	});
}

function pickScalabilityMode(availableModes: string[] | undefined): string {
	const list = Array.isArray(availableModes) ? availableModes : [];
	for (const candidate of PREFERRED_SVC_MODES) {
		if (list.includes(candidate)) return candidate;
	}
	return list[0] || PREFERRED_SVC_MODES[0];
}

function routerAvailableScalabilityModes(
	routerCapabilities: RouterCapabilities,
): string[] {
	const codecs = Array.isArray(routerCapabilities?.codecs)
		? routerCapabilities.codecs
		: [];
	const vp9 = codecs.find((c) => {
		const mime = c?.mimeType || c?.mime_type || "";
		return mime.toLowerCase().includes("vp9");
	});
	if (vp9 && Array.isArray(vp9.scalabilityModes))
		return vp9.scalabilityModes.filter((m) => m.length > 0) as string[];

	return [];
}

export function resolveCodecStrategy({
	preference,
	deviceCapabilities,
	routerCapabilities = null,
}: {
	preference: string;
	deviceCapabilities?: DeviceCapabilities;
	routerCapabilities?: RouterCapabilities | null;
}): CodecDecision {
	const normalizedPref = normalizeCodecStrategy(preference);
	const support = detectBrowserSupport();
	const routerModes = routerAvailableScalabilityModes(routerCapabilities);
	const browserModes = support.availableScalabilityModes || [];
	const intersectModes = browserModes.filter((m) => routerModes.includes(m));
	const routerAdvertisesModes =
		Array.isArray(routerModes) && routerModes.length > 0;

	const canUseSVC =
		support.supportsSVC && routerSupportsVP9(deviceCapabilities || null);

	let strategy: "svc" | "simulcast" = "simulcast";
	if (normalizedPref === "simulcast") strategy = "simulcast";
	else if (normalizedPref === "svc") strategy = canUseSVC ? "svc" : "simulcast";
	else strategy = canUseSVC ? "svc" : "simulcast";

	const chosenMode =
		strategy === "svc"
			? pickScalabilityMode(
					intersectModes.length
						? intersectModes
						: routerAdvertisesModes
							? routerModes
							: browserModes,
				)
			: null;

	return {
		strategy,
		scalabilityMode: chosenMode,
		didDowngrade: normalizedPref === "svc" && strategy !== "svc",
		requested: normalizedPref,
	};
}
