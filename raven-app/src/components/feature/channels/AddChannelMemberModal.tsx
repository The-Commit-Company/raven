import { Button, ButtonGroup, chakra, FormControl, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Text } from '@chakra-ui/react'
import { useContext, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { BiHash, BiLockAlt } from 'react-icons/bi'
import { AddMembersDropdown } from '../select-member/AddMembersDropdown'
import { ChakraStylesConfig } from "chakra-react-select"
import { fallbackPfp, pfp, MemberOption } from "../select-member/AddMembersDropdown"
import { ChannelContext } from '../../../utils/channel/ChannelProvider'
import { useFrappeCreateDoc } from 'frappe-react-sdk'

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

  console.log(channelData)
  const methods = useForm<FormProps>({
    defaultValues: {
      add_members: null
    }
  })

  const { handleSubmit, reset } = methods

  useEffect(() => {
    reset()
  }, [isOpen, reset])

  const members = methods.watch('add_members')

  const onSubmit = (data: FormProps) => {
    createDoc('Raven Channel Member', {
      channel: channelData[0].name,
      members: members
    }).then((d) => {
      console.log(d)
    }).catch((err) => {
      console.log(err)
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>

      <ModalOverlay />
      <ModalContent>

        <ModalHeader>
          <HStack>
            <Text>Add members to </Text>
            {channelData[0].type === 'Public'
              ?
              <HStack><BiHash /><Text>{channelData[0].channel_name}</Text></HStack>
              :
              <HStack><BiLockAlt /><Text>{channelData[0].channel_name}</Text></HStack>
            }
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <FormProvider {...methods}>
          <chakra.form onSubmit={handleSubmit(onSubmit)}>

            <ModalBody>
              <Stack spacing={4}>

                <Text>Anyone you add will be able to see all of the channel’s contents</Text>

                <FormControl>
                  <AddMembersDropdown autoFocus name="add_members" chakraStyles={customStyles} />
                </FormControl>

                <Text fontSize='sm' color='gray.500'>New members will be able to see all of <strong>{channelData[0].channel_name}</strong>'s history, including any files that have been shared in the channel.</Text>

              </Stack>
            </ModalBody>

            <ModalFooter>
              <ButtonGroup>
                <Button variant='ghost' onClick={onClose}>Cancel</Button>
                <Button colorScheme='blue' type='submit'>Save</Button>
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