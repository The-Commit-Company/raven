import { useGetUser } from "@/hooks/useGetUser"
import { Link } from "react-router-dom"
import { Message } from "../../../../../../../types/Messaging/Message"
import { Button, Flex, Separator, Text } from "@radix-ui/themes"
import { MessageContent } from "../MessageItem"
import { ViewThreadParticipants } from "@/components/feature/threads/ThreadParticipants"
import { useFrappeGetDocCount } from "frappe-react-sdk"
import { RavenMessage } from "@/types/RavenMessaging/RavenMessage"
import { useIsMobile } from "@/hooks/useMediaQuery"

export const ThreadMessage = ({ thread }: { thread: Message }) => {

    const user = useGetUser(thread.owner)

    return (
        <Flex direction='column' gap='2' className="px-3 py-2 border border-gray-4 rounded-md">
            <Flex direction='column' gap='2'>
                <MessageContent message={thread} user={user} />
                <Flex justify={'between'}>
                    <Flex align={'center'} gap='2'>
                        <ThreadReplyCount thread={thread} />
                        <Separator orientation='vertical' />
                        <Button size={'1'}
                            asChild
                            variant={'ghost'}
                            className={'not-cal w-fit hover:bg-transparent hover:underline cursor-pointer font-semibold'}>
                            <Link to={`/channel/${thread.channel_id}/thread/${thread.name}`}>View Thread</Link>
                        </Button>
                    </Flex>
                    <ViewThreadParticipants participants={thread.thread_participants ?? []} />
                </Flex>
            </Flex>
        </Flex>
    )
}

const ThreadReplyCount = ({ thread }: { thread: Message }) => {

    const { data } = useFrappeGetDocCount<RavenMessage>("Raven Message", [["channel_id", "=", thread.name]], undefined, undefined, undefined, {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        keepPreviousData: false
    })

    // TODO: Listen to realtime event for new message count

    return <Flex gap='1' align={'center'}>
        <Text size='1' className={'text-gray-11'}>Replies:</Text>
        <Text size='1' className={'font-medium'}>{data ?? 0}</Text>
    </Flex>
}