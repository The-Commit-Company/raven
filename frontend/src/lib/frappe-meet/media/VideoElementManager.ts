// @ts-nocheck
/**
 * Video Element Manager
 *
 * Manages video and audio elements for participants.
 */
import { selectedSpeakerId } from "../_mediaPreferences";

export class VideoElementManager {
	constructor() {
		this.videoElements = new Map();
		this.audioElements = new Map();
		this.deferredAttachments = new Map();
	}

	registerVideoElement(participantId, element) {
		if (!element || !participantId) return;

		const previousElement = this.videoElements.get(participantId);
		const previousVideoStream = previousElement?.srcObject;

		// Only update srcObject if element doesn't have one, or if we're re-registering with a different track
		if (previousVideoStream && !element.srcObject) {
			console.log("Preserving stream during video element re-registration", {
				participantId,
				streamId: previousVideoStream.id,
				trackCount: previousVideoStream.getTracks().length,
			});

			const videoTracks = previousVideoStream.getVideoTracks();
			if (videoTracks.length > 0) {
				const previousVideoTrack = videoTracks[0];
				const existingVideoTrack = element.srcObject?.getVideoTracks?.()?.[0];
				const videoTrackChanged =
					!existingVideoTrack ||
					existingVideoTrack.id !== previousVideoTrack.id;

				if (!element.srcObject || videoTrackChanged) {
					element.srcObject = new MediaStream(videoTracks);
				}
			}
			// we have a separate audio element for audio playback
			element.muted = true;
		}

		this.videoElements.set(participantId, element);

		if (this.deferredAttachments.has(participantId)) {
			const { stream, isLocal } = this.deferredAttachments.get(participantId);
			this.attachStream(participantId, stream, isLocal);
			this.deferredAttachments.delete(participantId);
		}
	}

	async attachStream(participantId, stream, isLocal = false) {
		const videoElement = this.videoElements.get(participantId);
		const audioTracks = stream.getAudioTracks();

		// Always attach audio for remote participants, even if no video element exists
		if (!isLocal && audioTracks.length > 0) {
			this.attachAudioStream(participantId, audioTracks);
		}

		// Only defer if we have video tracks and no video element
		// Audio-only streams don't need video elements, so don't defer them
		if (!videoElement && !isLocal && stream.getVideoTracks().length > 0) {
			this.deferredAttachments.set(participantId, { stream, isLocal });
			return;
		}

		if (videoElement) {
			const videoTracks = stream.getVideoTracks();

			if (videoTracks.length > 0) {
				const newVideoTrack = videoTracks[0];
				const existingVideoTrack =
					videoElement.srcObject?.getVideoTracks?.()?.[0];
				const videoTrackChanged =
					!existingVideoTrack || existingVideoTrack.id !== newVideoTrack.id;

				if (!videoElement.srcObject || videoTrackChanged) {
					console.log(`Attaching video track for ${participantId}`, {
						trackId: newVideoTrack.id,
						hadExisting: !!existingVideoTrack,
						changed: videoTrackChanged,
					});
					const videoStream = new MediaStream(videoTracks);
					videoElement.srcObject = videoStream;
					// we have a separate audio element for audio playback
					videoElement.muted = true;

					try {
						await videoElement.play();
					} catch (err) {
						console.error(`Error playing video for ${participantId}:`, err);
					}
				} else {
					console.log(
						`Skipping video re-attach for ${participantId} - same track`,
					);
				}
			}
		}
	}

	attachAudioStream(participantId, audioTracks) {
		let audioElement = this.audioElements.get(participantId);

		if (!audioElement) {
			audioElement = document.createElement("audio");
			audioElement.autoplay = true;
			audioElement.playsinline = true;
			audioElement.style.display = "none";
			document.body.appendChild(audioElement);

			if (selectedSpeakerId.value) {
				audioElement.setSinkId(selectedSpeakerId.value).catch((err) => {
					console.warn(
						`Failed to set initial speaker for ${participantId}:`,
						err,
					);
				});
			}

			this.audioElements.set(participantId, audioElement);
			console.log(`Created separate audio element for ${participantId}`);
		}

		const newAudioTrack = audioTracks[0];
		const existingAudioTrack = audioElement.srcObject?.getAudioTracks?.()?.[0];
		const audioTrackChanged =
			!existingAudioTrack || existingAudioTrack.id !== newAudioTrack.id;

		if (!audioElement.srcObject || audioTrackChanged) {
			const audioStream = new MediaStream(audioTracks);
			audioElement.srcObject = audioStream;

			// Try to play audio
			audioElement.play().catch((err) => {
				console.warn(
					`Audio autoplay failed for ${participantId}:`,
					err.message,
				);
			});
		}
	}

	async playVideo(element, participantId) {
		try {
			await element.play();
			return true;
		} catch (error) {
			if (error.name === "NotAllowedError") {
				console.warn(
					`Autoplay blocked for ${participantId}, will play on user interaction`,
				);
				this.addUserInteractionHandler(element, participantId);
			} else {
				console.warn(`Video play failed for ${participantId}:`, error.message);
			}
			return false;
		}
	}

	addUserInteractionHandler(element, participantId) {
		const playOnInteraction = async () => {
			try {
				await element.play();

				document.removeEventListener("click", playOnInteraction);
				document.removeEventListener("touchstart", playOnInteraction);
			} catch (error) {
				console.warn(
					`Unable to play video for ${participantId}:`,
					error.message,
				);
			}
		};

		document.addEventListener("click", playOnInteraction, { once: true });
		document.addEventListener("touchstart", playOnInteraction, { once: true });
	}

	removeVideoElement(participantId) {
		const element = this.videoElements.get(participantId);
		let hadStream = false;
		if (element?.srcObject) {
			hadStream = true;
			for (const track of element.srcObject.getTracks()) {
				track.stop();
			}
			element.srcObject = null;
		}

		const audioElement = this.audioElements.get(participantId);
		if (audioElement) {
			if (audioElement.srcObject) {
				for (const track of audioElement.srcObject.getTracks()) {
					track.stop();
				}
				audioElement.srcObject = null;
			}
			audioElement.remove();
			this.audioElements.delete(participantId);
		}

		this.videoElements.delete(participantId);
		this.deferredAttachments.delete(participantId);

		console.log(`Video/Audio elements removed for ${participantId}`, {
			hadStream,
			elementExists: !!element,
			hadAudioElement: !!audioElement,
		});
	}

	cleanup() {
		for (const [_participantId, element] of this.videoElements.entries()) {
			if (element?.srcObject) {
				for (const track of element.srcObject.getTracks()) {
					track.stop();
				}
				element.srcObject = null;
			}
		}

		for (const [_participantId, audioElement] of this.audioElements.entries()) {
			if (audioElement?.srcObject) {
				for (const track of audioElement.srcObject.getTracks()) {
					track.stop();
				}
				audioElement.srcObject = null;
			}
			audioElement.remove();
		}

		this.videoElements.clear();
		this.audioElements.clear();
		this.deferredAttachments.clear();
	}
}
