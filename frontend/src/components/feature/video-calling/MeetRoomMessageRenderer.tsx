import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { HStack, Stack } from '@/components/layout/Stack'
import { RavenMeetRoom } from '@/types/RavenIntegrations/RavenMeetRoom'
import { Box, Button, Card, Skeleton, Text } from '@radix-ui/themes'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { BiVideo } from 'react-icons/bi'
import { Link as RouterLink } from 'react-router-dom'

/**
 * Inline renderer for `link_doctype = 'Raven Meet Room'` messages.
 * Plugged into `DoctypeLinkMessageRenderer` so that announcement
 * messages posted by `RavenMeetRoom.after_insert` show up as a
 * clickable "Join Call" card in the channel feed.
 *
 * Mirrors `VideoCallMessageRenderer.tsx` from PR #1486 in shape so
 * the channel UX is identical regardless of which provider was used.
 */
const MeetRoomMessageRenderer = ({ roomID }: { roomID: string }) => {
    const { data, error, isLoading } = useFrappeGetCall<{ message: RavenMeetRoom }>(
        'raven.api.frappe_meet.get_room_details',
        { room_id: roomID },
        undefined,
        { revalidateOnFocus: false }
    )

    return (
        <Box className='max-w-[550px] min-w-[200px] py-2'>
            {isLoading ? (
                <Skeleton className='w-96 h-24 rounded-md' />
            ) : error ? (
                <Card>
                    <ErrorBanner error={error} />
                </Card>
            ) : data?.message ? (
                <MeetRoomCard data={data.message} />
            ) : null}
        </Box>
    )
}

const MeetRoomCard = ({ data }: { data: RavenMeetRoom }) => {
    return (
        <Card>
            <HStack justify='between' align='center' gap='4'>
                <Stack gap='1'>
                    <Text weight='bold' size='3'>{data.room_name}</Text>
                    {data.description && (
                        <Text size='2' className='text-gray-11'>{data.description}</Text>
                    )}
                </Stack>
                <Button asChild>
                    <RouterLink to={`/meeting-room/${data.name}`}>
                        <BiVideo size={16} />
                        Join Call
                    </RouterLink>
                </Button>
            </HStack>
        </Card>
    )
}

export default MeetRoomMessageRenderer
