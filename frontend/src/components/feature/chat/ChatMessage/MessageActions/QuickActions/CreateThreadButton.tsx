import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { QuickActionButton } from './QuickActionButton'
import { BiMessageDetail } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'

const CreateThreadButton = ({ messageID }: { messageID: string }) => {

    const navigate = useNavigate()

    const { call } = useFrappePostCall('raven.api.threads.create_thread')
    const handleCreateThread = () => {
        call({ 'message_id': messageID }).then((res) => {
            toast.success('Thread created successfully!')
            navigate(`/channel/${res.message.channel_id}/thread/${res.message.thread_id}`)
        }).catch(() => {
            toast.error('Failed to create thread')
        })
    }
    return (
        <QuickActionButton
            tooltip='Create a thread'
            aria-label='Create a thread'
            onClick={handleCreateThread}>
            <BiMessageDetail size='16' />
        </QuickActionButton>
    )
}

export default CreateThreadButton