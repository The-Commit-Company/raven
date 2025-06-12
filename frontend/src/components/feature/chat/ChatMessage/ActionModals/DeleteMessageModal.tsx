import { Loader } from '@/components/common/Loader'
import { AlertDialog, Button, Callout, Flex, Text } from '@radix-ui/themes'
import { useFrappeDeleteDoc } from 'frappe-react-sdk'
import { FiAlertTriangle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Message } from '../../../../../../../types/Messaging/Message'
import { ErrorBanner } from '../../../../layout/AlertBanner/ErrorBanner'

interface DeleteMessageModalProps {
  onClose: (refresh?: boolean) => void
  message: Message
}

export const DeleteMessageModal = ({ onClose, message }: DeleteMessageModalProps) => {
  const { deleteDoc, error, loading: deletingDoc } = useFrappeDeleteDoc()
  const navigate = useNavigate()

  const onSubmit = async () => {
    return deleteDoc('Raven Message', message.name).then(() => {
      toast('Đã xóa tin nhắn', {
        duration: 800
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      message.is_thread && navigate(`/channel/${message.channel_id}`)
      onClose()
    })
  }

  return (
    <>
      <AlertDialog.Title>Xóa {message.is_thread ? 'Chủ đề' : 'Tin nhắn'}</AlertDialog.Title>

      <Flex direction={'column'} gap='2'>
        <Callout.Root color='red' size='1'>
          <Callout.Icon>
            <FiAlertTriangle size='18' />
          </Callout.Icon>
          <Callout.Text size='2'> Hành động này là vĩnh viễn và không thể hoàn tác.</Callout.Text>
        </Callout.Root>

        <ErrorBanner error={error} />
        {message.is_thread ? (
          <Text size='2'> Đây là một chủ đề. Nếu bạn xóa, toàn bộ tin nhắn trong chủ đề này cũng sẽ bị xóa.</Text>
        ) : (
          <Text size='2'> Bạn có chắc chắn muốn xóa tin nhắn này không? Nó sẽ bị xóa đối với tất cả người dùng.</Text>
        )}
      </Flex>

      <Flex gap='3' mt='4' justify='end'>
        <AlertDialog.Cancel>
          <Button variant='soft' color='gray'>
            Hủy
          </Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action>
          <Button variant='solid' color='red' onClick={onSubmit} disabled={deletingDoc}>
            {deletingDoc && <Loader className='text-white' />}
            {deletingDoc ? 'Đang xóa' : 'Xóa'}
          </Button>
        </AlertDialog.Action>
      </Flex>
    </>
  )
}
