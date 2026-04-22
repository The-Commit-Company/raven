// @ts-nocheck
import { useEffect, useRef, type MutableRefObject } from 'react'
import { BiMicrophoneOff } from 'react-icons/bi'
import type { Participant } from '@/hooks/useFrappeMeetLogic'

type Props = {
	participantId: string
	participant?: Participant
	displayName?: string
	stream?: MediaStream | null
	isLocal?: boolean
	/**
	 * Ref to the SFU manager so the tile can register its own
	 * `<video>` element with `videoManager.registerVideoElement(…)`.
	 * For the local tile we skip the manager and bind the local
	 * stream directly.
	 */
	managerRef?: MutableRefObject<any>
}

/**
 * Single participant video tile. Registers its `<video>` element
 * with the SFU `VideoElementManager` so incoming remote tracks get
 * attached automatically as they arrive. For the local participant
 * we just bind `localStream` directly to the element.
 *
 * Deliberately minimal for the v1 port — audio level meter, pinned
 * tile handling, network quality badge, and host controls are
 * follow-ups on top of this.
 */
const ParticipantTile = ({
	participantId,
	participant,
	displayName,
	stream,
	isLocal,
	managerRef,
}: Props) => {
	const videoRef = useRef<HTMLVideoElement | null>(null)

	useEffect(() => {
		const el = videoRef.current
		if (!el) return

		if (isLocal) {
			if (stream) {
				el.srcObject = stream
				el.muted = true
				el.play().catch(() => {
					/* autoplay may be blocked; retried on user interaction */
				})
			}
			return () => {
				if (el.srcObject === stream) el.srcObject = null
			}
		}

		// Remote: register the element with the video manager. It will
		// attach the appropriate MediaStream as consumers arrive.
		const manager = managerRef?.current
		manager?.videoManager?.registerVideoElement?.(participantId, el)

		return () => {
			try {
				manager?.videoManager?.unregisterVideoElement?.(participantId)
			} catch {
				/* no-op if manager already torn down */
			}
			if (el.srcObject) el.srcObject = null
		}
	}, [participantId, stream, isLocal, managerRef])

	const name = displayName || participant?.user_name || participantId
	const videoOff = participant?.video_enabled === false && !isLocal
	const audioMuted = isLocal
		? false // local audio mute is driven by track.enabled in the hook
		: participant?.audio_enabled === false

	return (
		<div className='relative bg-gray-12 rounded-lg overflow-hidden aspect-video shadow-md min-h-0'>
			<video
				ref={videoRef}
				autoPlay
				playsInline
				// Mirror the local preview so the user's left is on the
				// screen's left (matches every other video-chat UX).
				className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
			/>

			{videoOff && (
				<div className='absolute inset-0 flex items-center justify-center bg-gray-12 text-gray-1'>
					<span className='text-lg opacity-80'>{name}</span>
				</div>
			)}

			<div className='absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 text-white text-xs'>
				{audioMuted && <BiMicrophoneOff size={14} />}
				<span>{name}</span>
				{isLocal && <span className='opacity-70'>(you)</span>}
			</div>
		</div>
	)
}

export default ParticipantTile
