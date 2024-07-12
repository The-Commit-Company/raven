import { Box, Button, Flex, Separator, Text } from '@radix-ui/themes'
import { MessageContent, MessageSenderAvatar, UserHoverCard } from '../chat/ChatMessage/MessageItem'
import { useGetUser } from '@/hooks/useGetUser'
import { DateMonthYear } from '@/utils/dateConversions'
import { RavenThread } from '@/types/RavenMessaging/RavenThread'
import { Message } from '../../../../../types/Messaging/Message'

interface ThreadPreviewBoxProps {
    thread: RavenThread
}

export const ThreadPreviewBox = ({ thread }: ThreadPreviewBoxProps) => {

    const primaryThreadMessage = thread.messages[0]
    const user = useGetUser(primaryThreadMessage.owner)

    const totalReplies = thread.messages.length - 1

    return (
        <Flex direction='column' gap='2' className="group
            hover:bg-gray-100
            dark:hover:bg-gray-4
            p-2
            border border-gray-4
            rounded-md">
            <Flex gap='2'>
                <Text as='span' size='1'>{thread.channel_id}</Text>
                <Separator orientation='vertical' />
                <Text as='span' size='1' color='gray'><DateMonthYear date={thread.creation} /></Text>
                <Button size={'1'} variant={'ghost'} className={'not-cal hover:bg-transparent cursor-pointer'}>
                    Open thread
                </Button>
            </Flex>
            <Flex direction='column' gap='2'>
                <Flex gap='3'>
                    <MessageSenderAvatar userID={primaryThreadMessage.owner} user={user} isActive={false} />
                    <Flex direction='column' gap='1' justify='center'>
                        <Box mt='-1'>
                            <UserHoverCard user={user} userID={primaryThreadMessage.owner} isActive={false} />
                        </Box>
                        <MessageContent message={primaryThreadMessage as unknown as Message} user={user} />
                    </Flex>
                </Flex>
                <Text size='1' color='gray' className='truncate'>{totalReplies} repl{totalReplies === 1 ? 'y' : 'ies'}</Text>
            </Flex>
        </Flex>
    )
}