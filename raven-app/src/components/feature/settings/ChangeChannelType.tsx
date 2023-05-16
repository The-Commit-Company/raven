import { Button, ButtonGroup, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Text, UnorderedList, useToast } from '@chakra-ui/react'
import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { AlertBanner } from '../../layout/AlertBanner'
import { useContext } from 'react'
import { ChannelContext } from '../../../utils/channel/ChannelProvider'

interface ChangeChannelTypeProps {
    isOpen: boolean,
    onClose: () => void
}

export const ChangeChannelType = ({ isOpen, onClose }: ChangeChannelTypeProps) => {

    const toast = useToast()
    const { updateDoc, error } = useFrappeUpdateDoc()
    const { channelData } = useContext(ChannelContext)
    const new_channel_type = channelData?.type === 'Public' ? 'Private' : 'Public'

    const changeChannelType = (new_channel_type: 'Public' | 'Private') => {
        updateDoc("Raven Channel", channelData?.name ?? null, {
            type: new_channel_type
        }).then(() => {
            toast({
                title: "Channel type updated",
                status: "success",
                duration: 2000,
                isClosable: true
            })
            onClose()
        }).catch((err) => {
            toast({
                title: "Error updating channel type",
                description: err.message,
                status: "error",
                duration: 2000,
                isClosable: true
            })
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Change to a {new_channel_type.toLocaleLowerCase()} channel?</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <Stack>
                        {error && <AlertBanner status='error' heading={error.message}>{error.httpStatus} - {error.httpStatusText}</AlertBanner>}
                        {channelData?.type === 'Private' && <Stack spacing={4}>
                            <Text>Please understand that when you make <strong>{channelData?.channel_name}</strong> a public channel:</Text>
                            <UnorderedList px='4' spacing={2}>
                                <ListItem>Anyone from your organisation can join this channel and view its message history.</ListItem>
                                <ListItem>If you make this channel private again, it willbe visible to anyone who has joined the channel up until that point.</ListItem>
                            </UnorderedList>
                        </Stack>
                        }
                        {channelData?.type === 'Public' && <Stack spacing={4}>
                            <Text>Please understand that when you make <strong>{channelData?.channel_name}</strong> a private channel:</Text>
                            <UnorderedList px='4' spacing={2}>
                                <ListItem>No changes will be made to the channel's history or members</ListItem>
                                <ListItem>All files shared in this channel will become private and will be accessible only to the channel members</ListItem>
                            </UnorderedList>
                        </Stack>
                        }
                    </Stack>
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <Button variant='ghost' onClick={onClose}>Cancel</Button>
                        <Button colorScheme='blue' type='submit' onClick={() => changeChannelType(new_channel_type)}>Change to {new_channel_type.toLocaleLowerCase()}</Button>
                    </ButtonGroup>
                </ModalFooter>

            </ModalContent>
        </Modal>
    )
}