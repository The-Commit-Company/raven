import { useToast } from '@chakra-ui/react'
import { FormProvider, useForm } from 'react-hook-form'
import { AddMembersDropdown } from '../../select-member/AddMembersDropdown'
import { ChakraStylesConfig } from "chakra-react-select"
import { fallbackPfp, pfp, MemberOption } from "../../select-member/AddMembersDropdown"
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { ErrorBanner } from '../../../layout/AlertBanner'
import { Loader } from '@/components/common/Loader'
import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { Label } from '@/components/common/Form'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { RavenChannel } from '../../../../../../types/RavenChannelManagement/RavenChannel'

interface AddChannelMemberForm {
  add_members: string[] | null
}

const customStyles: ChakraStylesConfig<MemberOption> = {
  control: (chakraStyles) => ({ ...chakraStyles, backgroundColor: 'transparent', width: '100%', fontSize: 'sm' }),
  menu: (chakraStyles) => ({ ...chakraStyles, borderRadius: 'md', width: '100%', borderWidth: '1px' }),
  option: (chakraStyles, { isSelected, data }) => ({
    ...chakraStyles, ...((data.image && { ...pfp(data.image) }) || { ...fallbackPfp(data.label) }), width: '100%', fontSize: 'sm', ...(isSelected && {
      backgroundColor: "#E2E8F0",
      color: "black",
    })
  }),
  noOptionsMessage: (chakraStyles) => ({ ...chakraStyles, width: '100%', fontSize: 'sm' })
}

interface AddChannelMemberModalContentProps {
  channelID: string,
  channel_name: string,
  type: RavenChannel['type'],
  onClose: () => void,
  updateMembers: () => void
}

export const AddChannelMembersModalContent = ({ channelID, channel_name, onClose, type, updateMembers }: AddChannelMemberModalContentProps) => {

  const { createDoc, error, loading: creatingDoc } = useFrappeCreateDoc()
  const methods = useForm<AddChannelMemberForm>({
    defaultValues: {
      add_members: null
    }
  })

  const { handleSubmit } = methods
  const toast = useToast()

  const members = methods.watch('add_members')

  const onSubmit = () => {
    if (members && members.length > 0) {
      const promises = members.map(async (member) => {
        return createDoc('Raven Channel Member', {
          channel_id: channelID,
          user_id: member
        })
      })

      Promise.all(promises)
        .then(() => {
          toast({
            title: 'Members added successfully',
            status: 'success',
            duration: 2000,
            position: 'bottom',
            variant: 'solid',
            isClosable: true,
          })
          updateMembers()
          onClose()
        }).catch((e) => {
          if (e.httpStatus === 409) {
            toast({
              duration: 4000,
              position: 'bottom',
              variant: 'solid',
              isClosable: true,
              status: 'warning',
              title: `${e.httpStatus} - skipped pre-existing members`,
              description: 'One or more members already exist in this channel'
            })
            onClose()
          }
          else {
            toast({
              duration: 3000,
              position: 'bottom',
              variant: 'solid',
              isClosable: true,
              status: 'error',
              title: 'An error occurred',
              description: `${e.httpStatus} - ${e.httpStatusText}`
            })
          }
        })
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>

        <Dialog.Title>
          <Flex direction='row' align='center' gap='2'>
            <Text>Add members to</Text>
            {ChannelIcon({ type, size: '1.5rem' })}
            <Text>{channel_name}</Text>
          </Flex>
        </Dialog.Title>

        <Flex gap='2' direction='column' width='100%'>
          <ErrorBanner error={error} />
          <Box width='100%'>
            <Flex direction='column' gap='2'>
              <Label>Anyone you add will be able to see all of the channel’s contents</Label>
              <AddMembersDropdown autoFocus name="add_members" chakraStyles={customStyles} />
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