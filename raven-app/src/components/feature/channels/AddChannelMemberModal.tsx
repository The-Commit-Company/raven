import { Button, ButtonGroup, chakra, FormControl, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Text, useToast } from '@chakra-ui/react'
import { useContext, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { BiHash, BiLockAlt } from 'react-icons/bi'
import { AddMembersDropdown } from '../select-member/AddMembersDropdown'
import { ChakraStylesConfig } from "chakra-react-select"
import { fallbackPfp, pfp, MemberOption } from "../select-member/AddMembersDropdown"
import { ChannelContext } from '../../../utils/channel/ChannelProvider'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { AlertBanner } from '../../layout/AlertBanner'

interface AddChannelMemberModalProps {
  isOpen: boolean,
  onClose: () => void
}

interface FormProps {
  add_members: string[] | null
}

export const AddChannelMemberModal = ({ isOpen, onClose }: AddChannelMemberModalProps) => {

  const { channelData } = useContext(ChannelContext)
  const { createDoc, error, loading: creatingDoc, reset: resetCreate } = useFrappeCreateDoc()
  const methods = useForm<FormProps>({
    defaultValues: {
      add_members: null
    }
  })

  const { handleSubmit, reset } = methods
  const toast = useToast()

  useEffect(() => {
    reset()
    resetCreate()
  }, [isOpen, reset])

  const members = methods.watch('add_members')

  const onSubmit = (data: FormProps) => {
    if (members && members.length > 0) {
      const promises = members.map(async (member) => {
        return createDoc('Raven Channel Member', {
          channel_id: channelData?.name,
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
          onClose()
        }).catch((e) => {
          toast({
            duration: 3000,
            position: 'bottom',
            variant: 'solid',
            isClosable: true,
            status: 'error',
            title: 'Error: could not add the members to the channel',
            description: `${e.message}`
          })
        })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>

      <ModalOverlay />
      <ModalContent>

        <ModalHeader>
          <HStack>
            <Text>Add members to </Text>
            {channelData?.type === 'Public'
              ?
              <HStack><BiHash /><Text>{channelData?.channel_name}</Text></HStack>
              :
              <HStack><BiLockAlt /><Text>{channelData?.channel_name}</Text></HStack>
            }
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={creatingDoc} />

        <FormProvider {...methods}>
          <chakra.form onSubmit={handleSubmit(onSubmit)}>

            <ModalBody>
              <Stack spacing={4}>

                {error ? <AlertBanner status='error' heading={error.httpStatus === 409 ? 'Member already exists in this channel' : error.message}>{error.httpStatus} - {error.httpStatusText}</AlertBanner> : null}

                <Text>Anyone you add will be able to see all of the channel’s contents</Text>

                <FormControl>
                  <AddMembersDropdown autoFocus name="add_members" chakraStyles={customStyles} />
                </FormControl>

                <Text fontSize='sm' color='gray.500'>New members will be able to see all of <strong>{channelData?.channel_name}</strong>'s history, including any files that have been shared in the channel.</Text>

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