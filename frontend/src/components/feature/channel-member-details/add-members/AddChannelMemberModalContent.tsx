import { ErrorText } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { UserFields } from '@/utils/users/UserListProvider'
import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { Suspense, lazy } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
const AddMembersDropdown = lazy(() => import('../../selectDropdowns/AddMembersDropdown'))

interface AddChannelMemberForm {
  add_members: UserFields[] | null
}

interface AddChannelMemberModalContentProps {
  // channelID: string,
  // channel_name: string,
  // type: RavenChannel['type'],
  onClose: () => void
  // updateMembers: () => void,
  // channelMembers?: ChannelMembers
}

export const AddChannelMembersModalContent = ({ onClose }: AddChannelMemberModalContentProps) => {
  const { channelID } = useParams<{ channelID: string }>()

  const { channel } = useCurrentChannelData(channelID ?? '')

  const { mutate } = useSWRConfig()

  const { call, error, loading } = useFrappePostCall('raven.api.raven_channel_member.add_channel_members')

  const methods = useForm<AddChannelMemberForm>({
    defaultValues: {
      add_members: null
    }
  })

  const { handleSubmit, control } = methods

  const onSubmit = (data: AddChannelMemberForm) => {
    if (data.add_members && data.add_members?.length > 0) {
      call({
        channel_id: channelID,
        members: data.add_members?.map((member) => member.name)
      }).then(() => {
        toast.success('Thành viên đã được thêm vào')
        mutate(['channel_members', channelID])
        onClose()
      })
    }
  }

  return (
    <>
      {channelID && channel && (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Dialog.Title>
              <Text as='span'>
                Thêm thành viên vào
                <ChannelIcon type={channel?.channelData.type} size='18' className='inline-block -mb-0.5' />
                {channel?.channelData.channel_name}
              </Text>
            </Dialog.Title>
            <Dialog.Description size='2'>
              Thành viên mới sẽ có thể xem toàn bộ lịch sử của <strong>{channel?.channelData.channel_name}</strong>, bao
              gồm cả các tệp đã được chia sẻ trong kênh.
            </Dialog.Description>

            <Flex gap='2' pt='2' direction='column' width='100%'>
              <ErrorBanner error={error} />
              <Text size='2'>Bạn chỉ có thể thêm thành viên từ workspace của mình vào kênh này.</Text>
              <Box width='100%'>
                <Flex direction='column' gap='2'>
                  <Flex direction='column' gap='2'>
                    <Suspense fallback={<Loader />}>
                      <Controller
                        control={control}
                        name='add_members'
                        rules={{
                          validate: (value) => {
                            if (value && value?.length > 0) {
                              return true
                            }
                            return 'Vui lòng chọn ít nhất một thành viên'
                          }
                        }}
                        render={({ field: { onChange, value } }) => (
                          <AddMembersDropdown
                            setSelectedUsers={onChange}
                            workspaceID={channel?.channelData.workspace ?? ''}
                            selectedUsers={value ?? []}
                            channelID={channelID}
                            label=''
                          />
                        )}
                      />
                    </Suspense>
                    <ErrorText>{methods.formState.errors.add_members?.message}</ErrorText>
                  </Flex>
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
                {loading ? 'Đang lưu' : 'Lưu'}
              </Button>
            </Flex>
          </form>
        </FormProvider>
      )}
    </>
  )
}
