import eventBus from '@/utils/event-emitter'
import { useSidebarMode } from '@/utils/layout/sidebar'
import { ContextMenu, Flex } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
import { BiMessageDetail } from 'react-icons/bi'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { QuickActionButton } from './QuickActionButton'

const useCreateThread = (messageID: string) => {
  const navigate = useNavigate()

  const { workspaceID } = useParams()

  const { call } = useFrappePostCall('raven.api.threads.create_thread')

  const { title } = useSidebarMode()

  const handleCreateThread = () => {
    call({ message_id: messageID })
      .then((res) => {
        toast.success('Thread created')

        if (title === 'Chủ đề') {
          eventBus.emit('thread:created', {
            threadId: res.message.thread_id,
            messageId: messageID
          })
        }

        navigate(`/${workspaceID}/${res.message.channel_id}/thread/${res.message.thread_id}`)
      })
      .catch(() => {
        toast.error('Failed to create thread')
      })
  }

  return handleCreateThread
}

export const CreateThreadActionButton = ({ messageID }: { messageID: string }) => {
  const handleCreateThread = useCreateThread(messageID)

  return (
    <QuickActionButton tooltip='Create a thread' aria-label='Create a thread' onClick={handleCreateThread}>
      <BiMessageDetail size='16' />
    </QuickActionButton>
  )
}

export const CreateThreadContextItem = ({ messageID }: { messageID: string }) => {
  const handleCreateThread = useCreateThread(messageID)

  return (
    <ContextMenu.Item>
      <Flex gap='2' align='center' width='100%' onClick={handleCreateThread}>
        <BiMessageDetail size='18' />
        Tạo chủ đề
      </Flex>
    </ContextMenu.Item>
  )
}
