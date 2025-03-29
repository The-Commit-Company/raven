import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { QuickActionButton } from './QuickActionButton'
import { BiMessageDetail } from 'react-icons/bi'
import { useNavigate, useParams } from 'react-router-dom'
import { ContextMenu, Flex } from '@radix-ui/themes'

const useCreateThread = (messageID: string) => {
    const navigate = useNavigate()

    const { workspaceID } = useParams()

    const { call } = useFrappePostCall('raven.api.threads.create_thread')
    const handleCreateThread = () => {
        call({ 'message_id': messageID }).then((res) => {
            toast.success('Thread created')
            navigate(`/${workspaceID}/${res.message.channel_id}/thread/${res.message.thread_id}`)
        }).catch(() => {
            toast.error('Failed to create thread')
        })
    }

    return handleCreateThread
}

export const CreateThreadActionButton = ({ messageID }: { messageID: string }) => {

    const handleCreateThread = useCreateThread(messageID)

    return (
        <QuickActionButton
            tooltip='Create a thread'
            aria-label='Create a thread'
            onClick={handleCreateThread}>
            <BiMessageDetail size='16' />
        </QuickActionButton>
    )
}

export const CreateThreadContextItem = ({ messageID }: { messageID: string }) => {

    const handleCreateThread = useCreateThread(messageID)

    return <ContextMenu.Item>
        <Flex gap='2' align='center' width='100%' onClick={handleCreateThread}>
            <BiMessageDetail size='18' />
            Create Thread

        </Flex>
    </ContextMenu.Item>
}