import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { HStack, Stack } from "@/components/layout/Stack"
import { RavenLiveKitRoom } from "@/types/RavenIntegrations/RavenLiveKitRoom"
import { Box, Button, Card, Link, Skeleton, Text } from "@radix-ui/themes"
import { useFrappeGetCall } from "frappe-react-sdk"
import { BiPhone } from "react-icons/bi"

const VideoCallMessageRenderer = ({ roomID }: { roomID: string }) => {
    const { data, error, isLoading } = useFrappeGetCall<{ message: RavenLiveKitRoom }>('raven.api.livekit.get_room_details', {
        room_id: roomID
    })

    return (
        <Box className='max-w-[550px] min-w-[75px] py-2'>
            {
                isLoading ?
                    <Skeleton className='w-96 h-32 rounded-md' /> :
                    error ?
                        <Card>
                            <ErrorBanner error={error} />
                        </Card> :
                        data && <VideoCallCard data={data.message} />
            }
        </Box>
    )
}

const VideoCallCard = ({ data }: { data: RavenLiveKitRoom }) => {
    return <Card>
        <HStack justify='between' align='center'>
            <Stack gap='1'>
                <Text weight='bold' size='3'>{data.room_name}</Text>
                {data.description && <Text size='2' className="text-gray-11">{data.description}</Text>}

            </Stack>
            <HStack>
                <Button className="not-cal" asChild>
                    <Link href={`/meeting-room/${data.name}`} target="_blank" weight='medium'>
                        <BiPhone size={16} />
                        Join Call
                    </Link>
                </Button>
            </HStack>
        </HStack>

    </Card>
}

export default VideoCallMessageRenderer