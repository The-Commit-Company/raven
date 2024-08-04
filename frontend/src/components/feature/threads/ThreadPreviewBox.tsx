import { Box, Button, Flex, Separator, Text } from '@radix-ui/themes'
import { DateMonthYear } from '@/utils/dateConversions'
import { MessageContent, MessageSenderAvatar, UserHoverCard } from '../chat/ChatMessage/MessageItem'
import { useGetUser } from '@/hooks/useGetUser'
import { Message } from '../../../../../types/Messaging/Message'

export const ThreadPreviewBox = ({ thread }: { thread: Message }) => {

    console.log(thread)

    const user = useGetUser(thread.owner)

    return (
        <Flex direction='column' gap='2' className="group
            hover:bg-gray-100
            dark:hover:bg-gray-4
            px-3
            py-2
            border border-gray-4
            rounded-md">
            <Flex gap='2'>
                <Text as='span' size='1' className={'font-semibold'}>{thread.channel_id}</Text>
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
                <Button size={'1'} variant={'ghost'} className={'not-cal hover:bg-transparent cursor-pointer w-fit'}>
                    View Thread
                </Button>
            </Flex>
        </Flex>
    )
}