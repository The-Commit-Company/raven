import { useNavigate } from "react-router-dom"
import { Message } from "../../../../../../types/Messaging/Message"
import { useGetUser } from "@/hooks/useGetUser"
import { Box, Flex, Heading, IconButton } from "@radix-ui/themes"
import { IoMdClose } from "react-icons/io"
import { MessageContent, MessageSenderAvatar, UserHoverCard } from "../../chat/ChatMessage/MessageItem"

export const ThreadHeader = ({ threadMessage }: { threadMessage: Message }) => {

    const navigate = useNavigate()
    const user = useGetUser(threadMessage.owner)

    return (
        <header>
            <Flex direction={'column'} gap='2' className='pt-4 pl-4 pr-2 pb-2 border-gray-4 sm:dark:border-gray-6 border-b'>
                <Flex justify={'between'} align={'center'}>
                    <Heading size='4'>Thread</Heading>
                    <IconButton
                        className='mr-1'
                        variant="ghost"
                        color="gray"
                        aria-label="Close thread"
                        title="Close thread"
                        onClick={() => navigate('../')}>
                        <IoMdClose size='16' />
                    </IconButton>
                </Flex>
                <Flex gap='3'>
                    <MessageSenderAvatar userID={threadMessage.owner} user={user} isActive={false} />
                    <Flex direction='column' gap='0.5' justify='center'>
                        <Box mt='-1'>
                            <UserHoverCard user={user} userID={threadMessage.owner} isActive={false} />
                        </Box>
                        <MessageContent message={threadMessage} user={user} isThreadTitle />
                    </Flex>
                </Flex>
            </Flex>
        </header>
    )
}