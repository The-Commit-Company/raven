/* eslint-disable @typescript-eslint/no-unused-vars */
import { Loader } from '@/components/common/Loader'
import { AlertDialog, Button, Callout, Flex, Text } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
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
  const navigate = useNavigate()
  const { call, error, loading: isCalling } = useFrappePostCall('raven.api.raven_message.retract_message')

  const onSubmit = async () => {
    try {
      await call({ message_id: message.name })
      toast.success('Đã thu hồi tin nhắn', { duration: 800 })
      if (message.is_thread) {
        navigate(`/channel/${message.channel_id}`)
      }
      onClose(true)
    } catch (err: any) {
      toast.error('Đã quá thời gian thu hồi tin nhắn')
    }
  }

  return (
    <>
      <AlertDialog.Title>{message.is_thread ? 'Thu hồi Chủ đề' : 'Thu hồi Tin nhắn'}</AlertDialog.Title>

      <Flex direction='column' gap='2'>
        <Callout.Root color='red' size='1'>
          <Callout.Icon>
            <FiAlertTriangle size='18' />
          </Callout.Icon>
          <Callout.Text size='2'>
            Tin nhắn sẽ được thu hồi đối với tất cả người dùng. Nội dung sẽ không còn hiển thị.
          </Callout.Text>
        </Callout.Root>

        <ErrorBanner error={error} />

        {message.is_thread ? (
          <Text size='2'>
            Đây là một chủ đề. Nếu bạn thu hồi, tất cả nội dung trong chủ đề này sẽ bị ẩn đi đối với mọi người.
          </Text>
        ) : (
          <Text size='2'>Bạn có chắc chắn muốn thu hồi tin nhắn này không? Hành động này không thể hoàn tác.</Text>
        )}
      </Flex>

      <Flex gap='3' mt='4' justify='end'>
        <AlertDialog.Cancel>
          <Button variant='soft' color='gray'>
            Hủy
          </Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action>
          <Button variant='solid' color='red' onClick={onSubmit} disabled={isCalling}>
            {isCalling && <Loader className='text-white' />}
            {isCalling ? 'Đang thu hồi' : 'Thu hồi'}
          </Button>
        </AlertDialog.Action>
      </Flex>
    </>
  )
}
