import { Callout, Flex, Heading, Text } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { BiInfoCircle } from 'react-icons/bi'
import type { MeetConnectionDetails } from '@/pages/meeting/FrappeMeetRoom'
import type { LocalUserChoices } from './MeetRoomPreJoin'
import { useFrappeMeetLogic } from '@/hooks/useFrappeMeetLogic'
import MeetRoomGrid from './MeetRoomGrid'
import MeetRoomToolbar from './MeetRoomToolbar'

type Props = {
	details: MeetConnectionDetails
	choices: LocalUserChoices
	onLeave: () => void
}

/**
 * Active meeting room. Hosts the SFU connection (via
 * `useFrappeMeetLogic`), the participant grid, and the controls.
 *
 * Deliberately small: orchestration lives in the hook, layout lives
 * in `MeetRoomGrid` / `MeetRoomToolbar`. Keeps this file readable
 * even as the meeting feature set grows.
 */
const MeetRoomActive = ({ details, choices, onLeave }: Props) => {
	const meet = useFrappeMeetLogic({ details, choices })

	// Small delay before considering "still connecting" helps avoid a
	// confusing flash of the callout when the SFU responds instantly.
	const [showConnecting, setShowConnecting] = useState(false)
	useEffect(() => {
		const id = setTimeout(() => setShowConnecting(true), 400)
		return () => clearTimeout(id)
	}, [])

	const handleLeave = () => {
		onLeave()
	}

	return (
		<div className='w-screen h-screen flex flex-col bg-gray-1'>
			<header className='flex items-center justify-between px-6 py-3 bg-gray-3 border-b border-gray-5'>
				<Flex direction='column'>
					<Heading size='3'>{details.room_name}</Heading>
					<Text size='1' className='text-gray-11'>
						{choices.username} • {details.meeting_id}
					</Text>
				</Flex>
				<Text size='1' className='text-gray-11'>
					{meet.isSetupComplete
						? `${Object.keys(meet.participants).length + 1} participant${
								Object.keys(meet.participants).length === 0 ? '' : 's'
							}`
						: meet.isConnecting
							? 'Connecting…'
							: meet.error
								? 'Connection failed'
								: 'Ready'}
				</Text>
			</header>

			<main className='flex-1 min-h-0 relative'>
				{meet.error && (
					<Callout.Root color='red' className='m-4'>
						<Callout.Icon>
							<BiInfoCircle />
						</Callout.Icon>
						<Callout.Text>
							Could not connect to the SFU: {meet.error.message}
						</Callout.Text>
					</Callout.Root>
				)}

				{meet.isConnecting && !meet.error && showConnecting && (
					<div className='absolute top-4 right-4 z-10 px-3 py-1.5 rounded-md bg-gray-12 text-gray-1 text-sm shadow-md'>
						Connecting…
					</div>
				)}

				<MeetRoomGrid
					localParticipantId={details.user_id}
					localDisplayName={choices.username}
					localStream={meet.localStream}
					remoteParticipants={meet.participants}
					managerRef={meet.manager}
				/>
			</main>

			<MeetRoomToolbar
				audioEnabled={meet.audioEnabled}
				videoEnabled={meet.videoEnabled}
				onToggleAudio={meet.toggleAudio}
				onToggleVideo={meet.toggleVideo}
				onLeave={handleLeave}
			/>
		</div>
	)
}

export default MeetRoomActive
