import { Dialog, Flex, IconButton, Text, VisuallyHidden } from '@radix-ui/themes'
import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { useEffect } from 'react'
import { BiX } from 'react-icons/bi'
import { toast } from 'sonner'
import { TextMessage } from '../../../../../../../types/Messaging/Message'
import { ErrorBanner } from '../../../../layout/AlertBanner/ErrorBanner'
import Tiptap from '../../ChatInput/Tiptap'

interface EditMessageModalProps {
  onClose: (refresh?: boolean) => void
  message: TextMessage
}

export const EditMessageModal = ({ onClose, message }: EditMessageModalProps) => {
  const { updateDoc, error, loading: updatingDoc, reset } = useFrappeUpdateDoc()

  useEffect(() => {
    reset()
  }, [reset])

  const onSubmit = async (html: string, json: any) => {
    return updateDoc('Raven Message', message.name, { text: html, json }).then((d) => {
      onClose(true)
      toast.info('Message updated')
    })
  }

  return (
    <>
      <Flex justify={'between'}>
        <Dialog.Title>Chỉnh sửa tin nhắn</Dialog.Title>
        <VisuallyHidden>
          <Dialog.Description>Nhập nội dung tin nhắn mới</Dialog.Description>
        </VisuallyHidden>
        <Dialog.Close disabled={updatingDoc} className='invisible sm:visible'>
          <IconButton size='1' variant='soft' color='gray'>
            <BiX size='18' />
          </IconButton>
        </Dialog.Close>
      </Flex>

      <Flex gap='2' direction='column'>
        <ErrorBanner error={error} />
        <Tiptap
          onMessageSend={onSubmit}
          isEdit
          disableSessionStorage
          messageSending={updatingDoc}
          defaultText={message.text}
        />
        <Flex justify='end' className='hidden sm:block'>
          <Text size='1' color='gray'>
            Nhấn <b>Enter</b> để lưu
          </Text>
        </Flex>
      </Flex>
    </>
  )
}
