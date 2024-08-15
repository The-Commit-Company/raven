import { Box, Button, Flex, Separator, Text } from '@radix-ui/themes'
import { DateMonthYear } from '@/utils/dateConversions'
import { MessageContent, MessageSenderAvatar, UserHoverCard } from '../chat/ChatMessage/MessageItem'
import { useGetUser } from '@/hooks/useGetUser'
import { Message } from '../../../../../types/Messaging/Message'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { ViewThreadParticipants } from './ThreadParticipants'
import { useNavigate } from 'react-router-dom'

export const ThreadPreviewBox = ({ thread }: { thread: Message }) => {

    const user = useGetUser(thread.owner)
    const { channel } = useCurrentChannelData(thread.channel_id)

    const navigate = useNavigate()
    const handleViewThread = () => {
        navigate(`thread/${thread.name}`)
    }

    return (
        <Flex direction='column' gap='2' className="group
            hover:bg-gray-100
            dark:hover:bg-gray-4
            px-3
            py-2
            border border-gray-4
            rounded-md">
            <Flex gap='2' align={'center'}>
                <Flex gap='1' align={'center'} justify={'center'}>
                    <ChannelIcon type={channel?.channelData.type as "Private" | "Public" | "Open"} size='14' />
                    <Text as='span' size='2' className={'font-semibold'}>{thread.channel_id}</Text>
                </Flex>
                <Separator orientation='vertical' />
                <Text as='span' size='1' color='gray'><DateMonthYear date={thread.creation} /></Text>
            </Flex>
            <Flex gap='3'>
                <MessageSenderAvatar userID={thread.owner} user={user} isActive={false} />
                <Flex direction='column' gap='0.5' justify='center'>
                    <Box mt='-1'>
                        <UserHoverCard user={user} userID={thread.owner} isActive={false} />
                    </Box>
                    <MessageContent message={thread} user={user} />
                </Flex>
            </Flex>
            <Flex justify={'between'}>
                <Flex align={'center'} gap='2'>
                    <Flex gap='1' align={'center'}>
                        <Text size='1' className={'text-gray-11'}>Replies:</Text>
                        <Text size='1' className={'font-medium'}>{thread.thread_messages_count}</Text>
                    </Flex>
                    <Separator orientation='vertical' />
                    <Button size={'1'}
                        onClick={handleViewThread}
                        variant={'ghost'}
                        className={'not-cal w-fit hover:bg-transparent hover:underline cursor-pointer font-semibold'}>
                        View Thread
                    </Button>
                </Flex>
                <ViewThreadParticipants participants={thread.thread_participants ?? []} />
            </Flex>
        </Flex>
    )
}

export const ThreadMessage = ({ thread }: { thread: Message }) => {

    const navigate = useNavigate()
    const handleViewThread = () => {
        navigate(`thread/${thread.name}`)
    }
    const user = useGetUser(thread.owner)

    return (
        <Flex direction='column' gap='2' className="px-3 py-2 border border-gray-4 rounded-md">
            <Flex direction='column' gap='2'>
                <MessageContent message={thread} user={user} />
                <Flex justify={'between'}>
                    <Flex align={'center'} gap='2'>
                        <Flex gap='1' align={'center'}>
                            <Text size='1' className={'text-gray-11'}>Replies:</Text>
                            <Text size='1' className={'font-medium'}>{thread.thread_messages_count ?? 0}</Text>
                        </Flex>
                        <Separator orientation='vertical' />
                        <Button size={'1'}
                            onClick={handleViewThread}
                            variant={'ghost'}
                            className={'not-cal w-fit hover:bg-transparent hover:underline cursor-pointer font-semibold'}>
                            View Thread
                        </Button>
                    </Flex>
                    <ViewThreadParticipants participants={thread.thread_participants ?? []} />
                </Flex>
            </Flex>
        </Flex>
    )
}