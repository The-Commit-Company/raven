// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from 'react'
import {
	getSFUMeetingManager,
	resetSFUMeetingManager,
} from '@/lib/frappe-meet/sfu-meeting-manager'
import type { MeetConnectionDetails } from '@/pages/meeting/FrappeMeetRoom'
import type { LocalUserChoices } from '@/components/feature/video-calling/MeetRoomPreJoin'

/**
 * Raw participant shape emitted by the SFU meeting manager. Kept loose
 * intentionally because upstream's `ParticipantManager` doesn't have a
 * strict schema either (fields can be added incrementally via
 * `onParticipantUpdated`).
 */
export type Participant = {
	participantId: string
	user_id: string
	user_name: string
	avatar?: string | null
	audio_enabled?: boolean
	video_enabled?: boolean
	is_guest?: boolean
	isHost?: boolean
}

/**
 * React port of the orchestration part of `useMeetingLogic.js`
 * (frappe/meet). Wraps the SFU meeting manager lifecycle in a hook:
 *
 *   const meet = useFrappeMeetLogic({ details, choices })
 *
 * Lifecycle on mount:
 *   1. getUserMedia with audio + video
 *   2. getSFUMeetingManager().initialize({ meetingId, currentUser, eventHandlers })
 *   3. manager.connect(authToken)
 *   4. manager.joinRoom(userData, mediaState)
 *   5. manager.initializeDevice() + createReceiveTransport()
 *   6. manager.publishMedia(localStream, { publishVideo, publishAudio })
 *   7. manager.setupExistingParticipants()
 *
 * On unmount: disconnect the manager, reset the singleton, stop the
 * local media tracks.
 *
 * Returns participants (keyed by participantId), local stream, the
 * manager ref (for advanced use by children like ParticipantTile
 * registering their video element), plus audio/video toggles and a
 * `leave()` helper.
 *
 * The hook is deliberately `@ts-nocheck` for now — typing the
 * manager's event handler signatures is a follow-up that needs the
 * JS files to be converted. The runtime shape is stable and matches
 * upstream.
 */
export function useFrappeMeetLogic({
	details,
	choices,
}: {
	details: MeetConnectionDetails
	choices: LocalUserChoices
}) {
	const managerRef = useRef(null)
	const [participants, setParticipants] = useState<Record<string, Participant>>({})
	const [localStream, setLocalStream] = useState<MediaStream | null>(null)
	const [isSetupComplete, setIsSetupComplete] = useState(false)
	const [isConnecting, setIsConnecting] = useState(true)
	const [audioEnabled, setAudioEnabled] = useState(choices.audioEnabled)
	const [videoEnabled, setVideoEnabled] = useState(choices.videoEnabled)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		let active = true
		let streamCreated: MediaStream | null = null

		const setup = async () => {
			try {
				// 1. Acquire local camera + microphone
				streamCreated = await navigator.mediaDevices.getUserMedia({
					audio: choices.audioDeviceId
						? { deviceId: { exact: choices.audioDeviceId } }
						: true,
					video: choices.videoDeviceId
						? { deviceId: { exact: choices.videoDeviceId } }
						: true,
				})

				if (!active) {
					streamCreated.getTracks().forEach((t) => t.stop())
					return
				}

				// Honor the initial enable flags picked in PreJoin
				streamCreated
					.getAudioTracks()
					.forEach((t) => (t.enabled = choices.audioEnabled))
				streamCreated
					.getVideoTracks()
					.forEach((t) => (t.enabled = choices.videoEnabled))

				setLocalStream(streamCreated)

				// 2. Initialize SFU manager
				const manager = getSFUMeetingManager()
				managerRef.current = manager

				manager.initialize({
					meetingId: details.meeting_id,
					currentUser: {
						user_id: details.user_id,
						full_name: details.user_data?.name || choices.username,
						avatar: details.user_data?.avatar || '',
					},
					eventHandlers: {
						onParticipantJoined: (p: Participant) => {
							if (!p) return
							const pid = p.participantId || p.user_id
							if (!pid || pid === details.user_id) return
							setParticipants((prev) => ({ ...prev, [pid]: p }))
						},
						onParticipantLeft: ({ participantId }: { participantId: string }) => {
							setParticipants((prev) => {
								if (!(participantId in prev)) return prev
								const { [participantId]: _removed, ...rest } = prev
								return rest
							})
						},
						onParticipantUpdated: (
							participantId: string,
							_participant: Participant,
							updates: Partial<Participant>,
						) => {
							if (!participantId || !updates) return
							setParticipants((prev) => ({
								...prev,
								[participantId]: { ...prev[participantId], ...updates },
							}))
						},
					},
				})

				// 3. Connect + join + device setup + publish + fetch roster
				await manager.connect(details.auth_token)
				await manager.joinRoom(
					{
						name: choices.username || details.user_data?.name || 'Guest',
						userId: details.user_id,
						avatar: details.user_data?.avatar || '',
						is_guest: false,
						isHost: false,
					},
					{
						audio_enabled: choices.audioEnabled,
						video_enabled: choices.videoEnabled,
					},
				)

				await manager.initializeDevice()
				await manager.createReceiveTransport()

				if (streamCreated) {
					try {
						await manager.publishMedia(streamCreated, {
							publishVideo: choices.videoEnabled,
							publishAudio: choices.audioEnabled,
						})
					} catch (publishErr) {
						console.warn(
							'Media publishing failed, continuing without media:',
							publishErr,
						)
					}
				}

				await manager.setupExistingParticipants()

				if (!active) return
				setIsSetupComplete(true)
				setIsConnecting(false)
			} catch (err) {
				console.error('Frappe Meet setup failed:', err)
				if (active) {
					setError(err as Error)
					setIsConnecting(false)
				}
			}
		}

		setup()

		return () => {
			active = false
			try {
				managerRef.current?.disconnect?.()
			} catch (e) {
				console.warn('Error while disconnecting SFU manager:', e)
			}
			managerRef.current = null
			try {
				resetSFUMeetingManager?.()
			} catch (e) {
				console.warn('Error while resetting SFU manager singleton:', e)
			}
			streamCreated?.getTracks().forEach((t) => t.stop())
		}
		// Only re-run the whole setup if the meeting ID itself changes —
		// changing choices mid-call is handled by toggle handlers below.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [details.meeting_id])

	const toggleAudio = useCallback(() => {
		setAudioEnabled((prev) => {
			const next = !prev
			localStream?.getAudioTracks().forEach((t) => (t.enabled = next))
			try {
				managerRef.current?.sfuClient?.emit?.('media_control', {
					kind: 'audio',
					action: next ? 'resume' : 'pause',
				})
			} catch {
				// manager may not be connected yet — safe to ignore
			}
			return next
		})
	}, [localStream])

	const toggleVideo = useCallback(() => {
		setVideoEnabled((prev) => {
			const next = !prev
			localStream?.getVideoTracks().forEach((t) => (t.enabled = next))
			try {
				managerRef.current?.sfuClient?.emit?.('media_control', {
					kind: 'video',
					action: next ? 'resume' : 'pause',
				})
			} catch {
				// manager may not be connected yet — safe to ignore
			}
			return next
		})
	}, [localStream])

	return {
		manager: managerRef,
		participants,
		localStream,
		isSetupComplete,
		isConnecting,
		audioEnabled,
		videoEnabled,
		error,
		toggleAudio,
		toggleVideo,
	}
}
