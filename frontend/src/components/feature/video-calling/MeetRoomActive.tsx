import { Button, Card, Flex, Heading, Text } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { BiPhoneOff } from 'react-icons/bi'
import type { MeetConnectionDetails } from '@/pages/meeting/FrappeMeetRoom'
import type { LocalUserChoices } from './MeetRoomPreJoin'

type Props = {
    details: MeetConnectionDetails
    choices: LocalUserChoices
    onLeave: () => void
}

/**
 * Active meeting room — wires the SFU manager and renders the
 * participant grid + toolbar.
 *
 * Currently a placeholder shell while the React port of the meet
 * `useMeetingLogic` composable is being landed incrementally
 * (~3000 LoC across MeetRoomGrid, ParticipantTile, MeetRoomToolbar
 * and the orchestration hooks). The connection-details fetch and
 * routing flow are already in place, so wiring the SFUMeetingManager
 * here is the next concrete step.
 *
 * The placeholder gives the host a working "End Call" button so
 * they can leave the room cleanly while we build the rest.
 */
const MeetRoomActive = ({ details, choices, onLeave }: Props) => {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(id)
    }, [])

    return (
        <div className='w-screen h-screen flex flex-col bg-gray-12 text-gray-1'>
            <header className='flex items-center justify-between px-6 py-3 bg-gray-11'>
                <Flex direction='column'>
                    <Heading size='4' className='text-gray-1'>{details.room_name}</Heading>
                    <Text size='1' className='text-gray-7'>
                        {choices.username} • Meeting ID {details.meeting_id}
                    </Text>
                </Flex>
                <Button color='red' size='3' onClick={onLeave}>
                    <BiPhoneOff size={18} />
                    End Call
                </Button>
            </header>

            <main className='flex-1 flex items-center justify-center p-8'>
                <Card className='max-w-2xl bg-gray-11 text-gray-3'>
                    <Flex direction='column' gap='3' p='4' align='start'>
                        <Heading size='3' className='text-gray-1'>Connecting to the SFU…</Heading>
                        <Text size='2'>
                            <strong>SFU URL:</strong> {details.sfu_url}
                        </Text>
                        <Text size='2'>
                            <strong>Meeting ID:</strong> {details.meeting_id}
                        </Text>
                        <Text size='2'>
                            <strong>Audio:</strong> {choices.audioEnabled ? 'on' : 'off'}{' '}
                            • <strong>Video:</strong> {choices.videoEnabled ? 'on' : 'off'}
                        </Text>
                        <Text size='1' className='text-gray-7 mt-2'>
                            ⚠️ The React port of the participant grid + media
                            controls is in progress. Audio/video streaming
                            will be wired in the next commit. End the call
                            with the button above to go back.
                        </Text>
                    </Flex>
                </Card>
            </main>
        </div>
    )
}

export default MeetRoomActive
