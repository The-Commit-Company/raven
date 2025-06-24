import { ErrorText } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import UsersOrChannelsDropdown from '@/components/feature/selectDropdowns/UsersOrChannelsDropdown'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import {
  ChannelListItem,
  useUpdateLastMessageDetails,
  useUpdateLastMessageInChannelList
} from '@/utils/channel/ChannelListProvider'
import { UserFields } from '@/utils/users/UserListProvider'
import { Box, Button, Dialog, Flex, IconButton, VisuallyHidden } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
import { Suspense } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { BiX } from 'react-icons/bi'
import { toast } from 'sonner'
import { Message } from '../../../../../../../types/Messaging/Message'

interface ForwardMessageModalProps {
  onClose: () => void
  message: Message
}

type ForwardMessageForm = {
  selected_options: (UserFields | ChannelListItem)[] | null
  message: Message
}

const ForwardMessageModal = ({ onClose, message }: ForwardMessageModalProps) => {
  const methods = useForm<ForwardMessageForm>({
    defaultValues: {
      selected_options: null,
      message: message
    }
  })

  const { handleSubmit, reset, control } = methods

  const { call, error, loading } = useFrappePostCall('raven.api.raven_message.forward_message')

  const { updateLastMessageForChannel } = useUpdateLastMessageDetails()
  const { updateLastMessageInChannelList } = useUpdateLastMessageInChannelList()

  const onSubmit = (data: ForwardMessageForm) => {
    if (data.selected_options && data.selected_options.length > 0) {
      call({
        message_receivers: data.selected_options,
        forwarded_message: data.message
      })
        .then(() => {
          data.selected_options!.forEach((receiver) => {
            let channelID = ''

            if (receiver.type === 'User') {
              channelID = (receiver as any).channel_id
            } else {
              channelID = receiver.name
            }

            const timestamp = new Date().toISOString()

            const messageDetails = {
              message_id: message.name,
              content: message.text || '',
              owner: message.owner
            }

            updateLastMessageInChannelList(channelID, timestamp, messageDetails)
            updateLastMessageForChannel(channelID, messageDetails, timestamp)
          })

          toast.success('Chuyển tiếp tin nhắn thành công')
          handleClose()
        })
        .catch(() => {
          toast.error('Chuyển tiếp tin nhắn thất bại')
        })
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex justify={'between'}>
          <Dialog.Title>Chuyển tiếp tin nhắn</Dialog.Title>
          <VisuallyHidden>
            <Dialog.Description>Chuyển tiếp tin nhắn đến người dùng hoặc nhóm chat</Dialog.Description>
          </VisuallyHidden>
          <Dialog.Close onClick={handleClose}>
            <IconButton size='1' variant='soft' color='gray'>
              <BiX size='18' />
            </IconButton>
          </Dialog.Close>
        </Flex>

        <Flex gap='2' direction='column' width='100%'>
          <ErrorBanner error={error} />
          <Box width='100%'>
            <Flex direction='column' gap='2'>
              <Suspense fallback={<Loader />}>
                <Controller
                  control={control}
                  name='selected_options'
                  rules={{
                    validate: (value) => {
                      if (value && value?.length > 0) {
                        return true
                      }
                      return 'Please select at least one member'
                    }
                  }}
                  render={({ field: { onChange, value } }) => (
                    <UsersOrChannelsDropdown setSelectedOptions={onChange} selectedOptions={value ?? []} />
                  )}
                />
              </Suspense>
              <ErrorText>{methods.formState.errors.selected_options?.message}</ErrorText>
            </Flex>
          </Box>
        </Flex>

        <Flex gap='3' mt='6' justify='end' align='center'>
          <Dialog.Close disabled={loading}>
            <Button variant='soft' color='gray'>
              Hủy
            </Button>
          </Dialog.Close>
          <Button type='submit' disabled={loading}>
            {loading && <Loader className='text-white' />}
            {loading ? 'Đang gửi' : 'Gửi'}
          </Button>
        </Flex>
      </form>
    </FormProvider>
  )
}

export default ForwardMessageModal
