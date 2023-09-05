import { Button, ButtonGroup, chakra, FormControl, HStack, Icon, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Text, useToast } from '@chakra-ui/react'
import { FormProvider, useForm } from 'react-hook-form'
import { AddMembersDropdown } from '../../select-member/AddMembersDropdown'
import { ChakraStylesConfig } from "chakra-react-select"
import { fallbackPfp, pfp, MemberOption } from "../../select-member/AddMembersDropdown"
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { ErrorBanner } from '../../../layout/AlertBanner'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { getChannelIcon } from '@/utils/layout/channelIcon'

interface AddChannelMemberModalProps {
  isOpen: boolean,
  onClose: () => void,
  channelID: string,
  type: ChannelListItem['type'],
  channel_name: string,
  updateMembers: () => void
}

interface FormProps {
  add_members: string[] | null
}

export const AddChannelMemberModal = ({ isOpen, onClose, type, channelID, channel_name, updateMembers }: AddChannelMemberModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <AddChannelMemberForm
          channelID={channelID}
          channel_name={channel_name}
          type={type}
          onClose={onClose}
          updateMembers={updateMembers} />
      </ModalContent>
    </Modal>
  )
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

interface AddChannelMemberFormProps {
  channelID: string,
  channel_name: string,
  type: ChannelListItem['type'],
  onClose: () => void,
  updateMembers: () => void
}

const AddChannelMemberForm = ({ channelID, channel_name, type, onClose, updateMembers }: AddChannelMemberFormProps) => {

  const { createDoc, error, loading: creatingDoc } = useFrappeCreateDoc()
  const methods = useForm<FormProps>({
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
      <chakra.form onSubmit={handleSubmit(onSubmit)}>

        <ModalHeader>
          <HStack>
            <Text>Add members to </Text>
            <Icon as={getChannelIcon(type)} />
            <Text>{channel_name}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={creatingDoc} />

        <ModalBody>
          <Stack spacing={4}>
            <ErrorBanner error={error} />

            <Text>Anyone you add will be able to see all of the channel’s contents</Text>

            <FormControl>
              <AddMembersDropdown autoFocus name="add_members" chakraStyles={customStyles} />
            </FormControl>

            <Text fontSize='sm' color='gray.500'>New members will be able to see all of <strong>{channel_name}</strong>'s history, including any files that have been shared in the channel.</Text>

          </Stack>
        </ModalBody>

        <ModalFooter>
          <ButtonGroup>
            <Button variant='ghost' onClick={onClose} isDisabled={creatingDoc}>Cancel</Button>
            <Button colorScheme='blue' type='submit' isLoading={creatingDoc}>Save</Button>
          </ButtonGroup>
        </ModalFooter>

      </chakra.form>
    </FormProvider>
  )

}