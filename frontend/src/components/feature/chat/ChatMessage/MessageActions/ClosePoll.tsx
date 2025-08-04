import { ContextMenu, Flex } from '@radix-ui/themes'
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { IoCloseCircleOutline } from 'react-icons/io5'
import { Poll } from '../Renderers/PollMessage'
import { Message } from '../../../../../../../types/Messaging/Message'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { useContext } from 'react'
import { UserContext } from '@/utils/auth/UserProvider'

interface ClosePollProps {
    message: Message
}

export const ClosePoll = ({ message }: ClosePollProps) => {

    const { currentUser } = useContext(UserContext)

    // fetch poll data using message_id
    const { data } = useFrappeGetCall<{ message: Poll }>('raven.api.raven_poll.get_poll', {
        'message_id': message?.name,
    }, `poll_data_${message?.poll_id}`, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })

    const { call } = useFrappePostCall('raven.api.raven_poll.close_poll')
    const onClosePoll = () => {
        return call({
            poll_id: message?.poll_id,
        }).then(() => {
            toast.success('Poll closed')
        }).catch((e) => {
            toast.error('Could not close poll', {
                description: getErrorMessage(e)
            })
        })
    }

    // Only show if user is poll owner and poll is not already closed
    if (data && data.message?.poll.owner === currentUser && !data.message?.poll.is_disabled)
        return (
            <>
                <ContextMenu.Item onClick={onClosePoll}>
                    <Flex gap='2'>
                        <IoCloseCircleOutline size='18' />
                        Close Poll
                    </Flex>
                </ContextMenu.Item>
                <ContextMenu.Separator />
            </>
        )

    return null
} 