import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { QuickActionButton } from './QuickActionButton'
import { BiMessageDetail } from 'react-icons/bi'

const CreateThreadButton = ({ messageID }: { messageID: string }) => {

    const { call } = useFrappePostCall('raven.api.threads.create_thread')
    const handleCreateThread = () => {
        call({ 'message_id': messageID }).then(() => {
            toast.success('Thread created successfully!')
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