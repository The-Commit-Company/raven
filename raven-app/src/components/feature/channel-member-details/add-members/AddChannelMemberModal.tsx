import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { ErrorBanner } from '../../../layout/AlertBanner'
import { Loader } from '@/components/common/Loader'
import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { RavenChannel } from '../../../../../../types/RavenChannelManagement/RavenChannel'
import { ChannelMembers } from '@/utils/channel/ChannelMembersProvider'
import { Suspense, lazy } from 'react'
import { UserFields } from '@/utils/users/UserListProvider'
import { ErrorText } from '@/components/common/Form'
import { useToast } from '@/hooks/useToast'
const AddMembersDropdown = lazy(() => import('../../select-member/AddMembersDropdown'))
interface AddChannelMemberForm {
  add_members: UserFields[] | null
}

interface AddChannelMemberModalContentProps {
  channelID: string,
  channel_name: string,
  type: RavenChannel['type'],
  onClose: () => void,
  updateMembers: () => void,
  channelMembers?: ChannelMembers
}

export const AddChannelMembersModalContent = ({ channelID, channel_name, onClose, type, updateMembers, channelMembers }: AddChannelMemberModalContentProps) => {

  const { createDoc, error, loading: creatingDoc } = useFrappeCreateDoc()
  const methods = useForm<AddChannelMemberForm>({
    defaultValues: {
      add_members: null
    }
  })

  const { handleSubmit, control } = methods
  const { toast } = useToast()

  const onSubmit = (data: AddChannelMemberForm) => {
    if (data.add_members && data.add_members.length > 0) {
      const promises = data.add_members.map(async (member) => {
        return createDoc('Raven Channel Member', {
          channel_id: channelID,
          user_id: member.name
        })
      })

      Promise.all(promises)
        .then(() => {
          toast({
            title: 'Members added successfully',
            variant: 'success',
            duration: 1000
          })
          updateMembers()
          onClose()
        })
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>

        <Dialog.Title>
          <Text>Add members to&nbsp; <ChannelIcon type={type} size='18' className='inline-block -mb-0.5' /> {channel_name}</Text>
        </Dialog.Title>

        <Dialog.Description>Anyone you add will be able to see all of the channel’s contents</Dialog.Description>

        <Flex gap='2' py='4' direction='column' width='100%'>
          <ErrorBanner error={error} />
          <Box width='100%'>
            <Flex direction='column' gap='4'>
              <Flex direction='column' gap='2'>
                <Suspense fallback={<Loader />}>
                  <Controller
                    control={control}
                    name='add_members'
                    rules={{
                      validate: (value) => {
                        if (value && value.length > 0) {
                          return true
                        }
                        return 'Please select at least one member'
                      }
                    }}
                    render={({ field: { onChange, value } }) => (
                      <AddMembersDropdown setSelectedUsers={onChange} selectedUsers={value ?? []} channelMembers={channelMembers} label='' />
                    )}
                  />
                </Suspense>
                <ErrorText>{methods.formState.errors.add_members?.message}</ErrorText>
              </Flex>
              <Text size='1' weight='light'>New members will be able to see all of <strong>{channel_name}</strong>'s history, including any files that have been shared in the channel.</Text>
            </Flex>
          </Box>
        </Flex>

        <Flex gap="3" mt="6" justify="end" align='center'>
          <Dialog.Close disabled={creatingDoc}>
            <Button variant="soft" color="gray">Cancel</Button>
          </Dialog.Close>
          <Button type='submit' disabled={creatingDoc}>
            {creatingDoc && <Loader />}
            {creatingDoc ? "Saving" : "Save"}
          </Button>
        </Flex>

      </form>
    </FormProvider>
  )

}