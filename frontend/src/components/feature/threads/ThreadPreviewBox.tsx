import { Box, Button, Flex, Separator, Text } from '@radix-ui/themes'
import { DateMonthYear } from '@/utils/dateConversions'
import { MessageContent, MessageSenderAvatar, UserHoverCard } from '../chat/ChatMessage/MessageItem'
import { useGetUser } from '@/hooks/useGetUser'
import { Message } from '../../../../../types/Messaging/Message'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { ViewThreadParticipants } from './ThreadParticipants'

export const ThreadPreviewBox = ({ thread }: { thread: Message }) => {

    const user = useGetUser(thread.owner)
    const { channel } = useCurrentChannelData(thread.channel_id)

    return (
        <Flex direction='column' gap='2' className="group
            hover:bg-gray-100
            dark:hover:bg-gray-4
            px-3
            py-2
            border border-gray-4
            rounded-md">
            <Flex gap='2'>
                <Flex gap='1' align={'center'} justify={'center'}>
                    <ChannelIcon type={channel?.channelData.type as "Private" | "Public" | "Open"} size='12' />
                    <Text as='span' size='1' className={'font-semibold'}>{thread.channel_id}</Text>
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
            <Flex gap='2'>
                <Flex>
                    <Text size='1' className={'text-gray-11'}>Replies: 0</Text>
                    <ViewThreadParticipants participants={thread.thread_participants ?? []} />
                </Flex>
                <Separator orientation='vertical' />
                <Button size={'1'} variant={'ghost'} className={'not-cal w-fit hover:bg-transparent cursor-pointer'}>
                    View Thread
                </Button>
            </Flex>
        </Flex>
    )
}