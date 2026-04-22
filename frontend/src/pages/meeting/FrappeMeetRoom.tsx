import { ErrorBanner, getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { Loader } from '@/components/common/Loader'
import { useUserData } from '@/hooks/useUserData'
import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes'
import { type FrappeError, useFrappePostCall } from 'frappe-react-sdk'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import MeetRoomPreJoin, { type LocalUserChoices } from '@/components/feature/video-calling/MeetRoomPreJoin'
import MeetRoomActive from '@/components/feature/video-calling/MeetRoomActive'

/**
 * Connection details returned by `raven.api.frappe_meet.join_room`.
 * Same shape as `meet.api.meeting.get_sfu_connection_details` plus
 * a few Raven-side fields enriched by `raven/api/frappe_meet.py`.
 */
export type MeetConnectionDetails = {
    sfu_url: string
    sfu_port: number | string
    auth_token: string
    user_id: string
    meeting_id: string
    codec_strategy?: string
    user_data: {
        name: string
        email: string
        avatar?: string | null
    }
    expires_in?: number

    // Raven-side enrichment
    room_id: string
    room_name: string
    channel_id: string
    workspace?: string
}

/**
 * Top-level meeting room page mounted at `/meeting-room/:roomID`.
 *
 * Lifecycle:
 *  1. Pull SFU connection details from `raven.api.frappe_meet.join_room`
 *     (which delegates to `meet.api.meeting.get_sfu_connection_details`
 *     for the JWT generation).
 *  2. Show `MeetRoomPreJoin` so the user can preview their camera/mic
 *     and pick their devices before going on-air.
 *  3. Once they hit Join, mount `MeetRoomActive` which wires the SFU
 *     manager and renders the participant grid + toolbar.
 *
 * On end call, navigate back to wherever the user came from.
 */
const FrappeMeetRoom = () => {
    const { roomID } = useParams()
    const navigate = useNavigate()
    const userData = useUserData()

    const [details, setDetails] = useState<MeetConnectionDetails | null>(null)
    const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | null>(null)
    const [loadError, setLoadError] = useState<FrappeError | null>(null)

    const { call: joinRoom, loading } = useFrappePostCall<{ message: MeetConnectionDetails }>(
        'raven.api.frappe_meet.join_room'
    )

    useEffect(() => {
        if (!roomID) return
        joinRoom({ room_id: roomID })
            .then((res) => setDetails(res.message))
            .catch((err: FrappeError) => {
                setLoadError(err)
                toast.error('Failed to join meeting', { description: getErrorMessage(err) })
            })
        // joinRoom is recreated on every render — only depend on roomID
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomID])

    const handleLeave = () => navigate(-1)

    if (!roomID) {
        return <CenterMessage>No meeting room specified.</CenterMessage>
    }

    if (loadError) {
        return (
            <Box className='w-screen h-screen p-8 bg-gray-1'>
                <ErrorBanner error={loadError} />
                <Flex justify='center' mt='4'>
                    <Button variant='soft' onClick={() => navigate(-1)}>Go back</Button>
                </Flex>
            </Box>
        )
    }

    if (loading || !details) {
        return (
            <CenterMessage>
                <Flex direction='column' align='center' gap='3'>
                    <Loader />
                    <Text size='2' className='text-gray-11'>Joining the call…</Text>
                </Flex>
            </CenterMessage>
        )
    }

    if (!preJoinChoices) {
        return (
            <MeetRoomPreJoin
                details={details}
                defaultUsername={userData.full_name || userData.name}
                onJoin={setPreJoinChoices}
                onCancel={handleLeave}
            />
        )
    }

    return (
        <MeetRoomActive
            details={details}
            choices={preJoinChoices}
            onLeave={handleLeave}
        />
    )
}

const CenterMessage = ({ children }: { children: React.ReactNode }) => (
    <Box className='w-screen h-screen flex items-center justify-center bg-gray-1'>
        <Flex direction='column' align='center' gap='4'>
            <Heading size='4'>Frappe Meet</Heading>
            <div className='text-gray-11'>{children}</div>
        </Flex>
    </Box>
)

export const Component = FrappeMeetRoom
