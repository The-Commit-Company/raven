import { useMemo } from 'react'
import type { MutableRefObject } from 'react'
import ParticipantTile from './ParticipantTile'
import type { Participant } from '@/hooks/useFrappeMeetLogic'

type Props = {
	localParticipantId: string
	localDisplayName: string
	localStream: MediaStream | null
	remoteParticipants: Record<string, Participant>
	managerRef: MutableRefObject<any>
}

/**
 * Responsive grid of participant tiles. Layout follows the simple
 * heuristic used by most conferencing apps:
 *   1 tile  → full width
 *   2 tiles → 1×2
 *   3-4     → 2×2
 *   5-9     → 3×3
 *   10+     → 4 columns, as many rows as needed
 *
 * Pinned / active-speaker / screen-share layouts are deliberately
 * out of scope for the v1 port (tracked in the plan file).
 */
const MeetRoomGrid = ({
	localParticipantId,
	localDisplayName,
	localStream,
	remoteParticipants,
	managerRef,
}: Props) => {
	const remoteIds = useMemo(
		() => Object.keys(remoteParticipants),
		[remoteParticipants],
	)
	const total = remoteIds.length + 1

	const cols =
		total <= 1 ? 1 : total <= 2 ? 2 : total <= 4 ? 2 : total <= 9 ? 3 : 4

	return (
		<div
			className='grid gap-2 p-4 w-full h-full'
			style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
		>
			<ParticipantTile
				participantId={localParticipantId}
				displayName={localDisplayName}
				stream={localStream}
				isLocal
			/>
			{remoteIds.map((pid) => (
				<ParticipantTile
					key={pid}
					participantId={pid}
					participant={remoteParticipants[pid]}
					managerRef={managerRef}
				/>
			))}
		</div>
	)
}

export default MeetRoomGrid
