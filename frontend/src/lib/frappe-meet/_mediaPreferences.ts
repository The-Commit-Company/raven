/**
 * localStorage-backed media preferences, framework-agnostic.
 *
 * Replaces `meet/frontend/src/data/mediaPreferences.ts` which exposes
 * Vue `Ref` objects. The SFU client only relies on the `.value` getter
 * for `selectedSpeakerId`, so we expose a minimal stand-in with the
 * same shape (`{ value: string }`).
 *
 * If the meeting room UI later needs reactive updates (device picker
 * changes selection), wrap these in a jotai atom or React state and
 * keep this stub as the storage backend.
 */

class StoredString {
	constructor(private readonly key: string, private readonly defaultValue = '') {}

	get value(): string {
		try {
			return localStorage.getItem(this.key) ?? this.defaultValue
		} catch {
			return this.defaultValue
		}
	}

	set value(v: string) {
		try {
			if (v) localStorage.setItem(this.key, v)
			else localStorage.removeItem(this.key)
		} catch {
			// ignore — quota / private mode
		}
	}
}

export const selectedSpeakerId = new StoredString('mediaPref.speakerId')
export const selectedCameraId = new StoredString('mediaPref.cameraId')
export const selectedMicrophoneId = new StoredString('mediaPref.micId')
