// @ts-nocheck
/**
 * Device Management Utilities
 */

class DeviceManager {
	constructor() {
		this.cameras = [];
		this.microphones = [];
		this.speakers = [];
		this.isEnumerating = false;
		this.deviceChangeListeners = [];
		this.hasVideoPermission = false;
		this.hasAudioPermission = false;
		this.setupDeviceChangeListener();
	}

	/**
	 * Check if we already have permissions without requesting them
	 */
	async checkExistingPermissions() {
		if (!navigator.permissions) return;

		const cameraPermission = await navigator.permissions.query({
			name: "camera",
		});
		this.hasVideoPermission = cameraPermission.state === "granted";

		const micPermission = await navigator.permissions.query({
			name: "microphone",
		});
		this.hasAudioPermission = micPermission.state === "granted";
	}

	/**
	 * Detect what type of devices changed by comparing current vs new device lists
	 * Returns { video: boolean, audio: boolean } indicating what changed
	 */
	async detectDeviceChanges() {
		const oldCameraCount = this.cameras.length;
		const oldMicCount = this.microphones.length;
		const oldSpeakerCount = this.speakers.length;

		const devices = await navigator.mediaDevices.enumerateDevices();
		const newCameraCount = devices.filter(
			(d) => d.kind === "videoinput",
		).length;
		const newMicCount = devices.filter((d) => d.kind === "audioinput").length;
		const newSpeakerCount = devices.filter(
			(d) => d.kind === "audiooutput",
		).length;

		return {
			videoChanged: newCameraCount !== oldCameraCount,
			audioChanged:
				newMicCount !== oldMicCount || newSpeakerCount !== oldSpeakerCount,
		};
	}

	async enumerateDevices(options = { video: false, audio: false }) {
		if (this.isEnumerating) return;

		try {
			this.isEnumerating = true;

			let permissionStream = null;

			// Only request permissions if explicitly requested
			// Why? Cuz I don't want camera LED from turning on unnecessarily
			if (options.video || options.audio) {
				try {
					const constraints = {};
					if (options.video) constraints.video = true;
					if (options.audio) constraints.audio = true;

					permissionStream =
						await navigator.mediaDevices.getUserMedia(constraints);

					if (options.video) this.hasVideoPermission = true;
					if (options.audio) this.hasAudioPermission = true;
				} catch (error) {
					console.warn(
						"Could not get media permissions for device enumeration:",
						error,
					);
				}
			}

			const devices = await navigator.mediaDevices.enumerateDevices();

			// this is needed to stop all tracks to release camera/mic hardware
			if (permissionStream) {
				for (const track of permissionStream.getTracks()) {
					track.stop();
				}
			}

			this.cameras = devices
				.filter((device) => device.kind === "videoinput")
				.map((device, index) => ({
					deviceId: device.deviceId,
					label: device.label || `Camera ${index + 1}`,
					groupId: device.groupId,
				}));

			this.microphones = devices
				.filter((device) => device.kind === "audioinput")
				.map((device, index) => ({
					deviceId: device.deviceId,
					label: device.label || `Microphone ${index + 1}`,
					groupId: device.groupId,
				}));

			this.speakers = devices
				.filter((device) => device.kind === "audiooutput")
				.map((device) => ({
					deviceId: device.deviceId,
					label: device.label || `Speaker ${this.speakers.length + 1}`,
					groupId: device.groupId,
				}));
		} catch (error) {
			console.error("Failed to enumerate devices:", error);
			throw error;
		} finally {
			this.isEnumerating = false;
		}
	}

	getCameras() {
		return this.cameras;
	}

	getMicrophones() {
		return this.microphones;
	}

	getSpeakers() {
		return this.speakers;
	}

	findDeviceById(deviceId, deviceType) {
		const devices =
			deviceType === "camera"
				? this.cameras
				: deviceType === "microphone"
					? this.microphones
					: this.speakers;
		return devices.find((device) => device.deviceId === deviceId);
	}

	getDefaultDevice(deviceType) {
		const devices =
			deviceType === "camera"
				? this.cameras
				: deviceType === "microphone"
					? this.microphones
					: this.speakers;
		return devices.length > 0 ? devices[0] : null;
	}

	isDeviceAvailable(deviceId, deviceType) {
		return this.findDeviceById(deviceId, deviceType) !== undefined;
	}

	setupDeviceChangeListener() {
		if (navigator.mediaDevices?.addEventListener) {
			navigator.mediaDevices.addEventListener("devicechange", async () => {
				console.log("Device change detected, re-enumerating devices...");

				try {
					const changes = await this.detectDeviceChanges();

					// Only request permissions if:
					// 1. We already have them, OR
					// 2. Only audio changed and we have audio permission
					const requestVideo = changes.videoChanged && this.hasVideoPermission;
					const requestAudio = changes.audioChanged && this.hasAudioPermission;

					console.log("Device change type:", {
						videoChanged: changes.videoChanged,
						audioChanged: changes.audioChanged,
						willRequestVideo: requestVideo,
						willRequestAudio: requestAudio,
					});

					await this.enumerateDevices({
						video: requestVideo,
						audio: requestAudio,
					});

					for (const listener of this.deviceChangeListeners) {
						try {
							listener();
						} catch (error) {
							console.error("Error in device change listener:", error);
						}
					}
				} catch (error) {
					console.error("Failed to re-enumerate devices on change:", error);
				}
			});
		}
	}

	addDeviceChangeListener(listener) {
		this.deviceChangeListeners.push(listener);
	}

	removeDeviceChangeListener(listener) {
		const index = this.deviceChangeListeners.indexOf(listener);
		if (index > -1) {
			this.deviceChangeListeners.splice(index, 1);
		}
	}
}

export const deviceManager = new DeviceManager();
