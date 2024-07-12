import { Box, Button, Flex, Separator, Text } from '@radix-ui/themes'
import { MessageContent, MessageSenderAvatar, UserHoverCard } from '../chat/ChatMessage/MessageItem'
import { useGetUser } from '@/hooks/useGetUser'
import { DateMonthYear } from '@/utils/dateConversions'
import { Thread } from './Threads'

interface ThreadPreviewBoxProps {
    thread: Thread
}

export const ThreadPreviewBox = ({ thread }: ThreadPreviewBoxProps) => {
    const user = useGetUser(thread.message.owner)
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
            <Flex direction='column'>
                <Flex gap='3'>
                    <MessageSenderAvatar userID={thread.message.owner} user={user} isActive={false} />
                    <Flex direction='column' gap='1' justify='center'>
                        <Box mt='-1'>
                            <UserHoverCard user={user} userID={thread.message.owner} isActive={false} />
                        </Box>
                        <MessageContent message={thread.message} user={user} />
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    )
}