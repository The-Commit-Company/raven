import { Box, Flex, Heading, IconButton } from '@radix-ui/themes'
import { useNavigate, useParams } from 'react-router-dom'
import { ThreadMessages } from './ThreadMessages'
import { IoMdClose } from 'react-icons/io'
import { useFrappeGetDoc } from 'frappe-react-sdk'
import { Message } from '../../../../../types/Messaging/Message'
import { ErrorBanner } from '@/components/layout/AlertBanner'
import { FullPageLoader } from '@/components/layout/Loaders'
import { MessageContent, MessageSenderAvatar, UserHoverCard } from '../chat/ChatMessage/MessageItem'
import { useGetUser } from '@/hooks/useGetUser'

const ThreadDrawer = () => {

    const { threadID } = useParams()
    const { data, error, isLoading } = useFrappeGetDoc('Raven Message', threadID)

    if (error) {
        return <Box p='2'>
            <ErrorBanner error={error} />
        </Box>
    }

    if (isLoading) {
        return <Box p='2'>
            <FullPageLoader />
        </Box>
    }

    if (data) {
        return (
            <Flex direction='column' gap='0' className='w-[50rem] h-[vh] border-l dark:bg-gray-2 bg-white z-[999]'>
                <ThreadHeader threadMessage={data} />
                <ThreadMessages threadID={threadID ?? ''} />
            </Flex>
        )
    }

    return null
}

export const Component = ThreadDrawer

const ThreadHeader = ({ threadMessage }: { threadMessage: Message }) => {
    const navigate = useNavigate()
    const user = useGetUser(threadMessage.owner)
    return (
        <header>
            <Flex direction={'column'} gap='2' className='pt-4 pl-4 pr-2 pb-2 border-gray-4 border-b'>
                <Flex justify={'between'} align={'center'}>
                    <Heading size='4'>Thread</Heading>
                    <IconButton
                        className='mr-1'
                        variant="ghost"
                        color="gray"
                        aria-label="Close thread"
                        title="Close thread"
                        onClick={() => navigate(-1)}>
                        <IoMdClose size='16' />
                    </IconButton>
                </Flex>
                <Flex gap='3'>
                    <MessageSenderAvatar userID={threadMessage.owner} user={user} isActive={false} />
                    <Flex direction='column' gap='0.5' justify='center'>
                        <Box mt='-1'>
                            <UserHoverCard user={user} userID={threadMessage.owner} isActive={false} />
                        </Box>
                        <MessageContent message={threadMessage} user={user} />
                    </Flex>
                </Flex>
            </Flex>
        </header>
    )
}