import { useContext } from 'react'
import { Button, ButtonGroup, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Text, UnorderedList, useToast } from '@chakra-ui/react'
import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { AlertBanner } from '../../layout/AlertBanner'
import { ChannelContext } from '../../../utils/channel/ChannelProvider'
import { useNavigate } from 'react-router-dom'

interface ArchiveChannelProps {
    isOpen: boolean,
    onClose: () => void
    onCloseViewDetails: () => void
}

export const ArchiveChannel = ({ isOpen, onClose, onCloseViewDetails }: ArchiveChannelProps) => {

    const { channelData } = useContext(ChannelContext)
    const toast = useToast()
    const { updateDoc, error } = useFrappeUpdateDoc()
    const navigate = useNavigate()

    const archiveChannel = () => {
        updateDoc('Raven Channel', channelData?.name ?? '', {
            is_archived: 1
        }).then(() => {
            onClose()
            onCloseViewDetails()
            navigate('/channel/general')
            toast({
                title: "Channel archived",
                status: "success",
                duration: 3000,
                isClosable: true
            })
        }).catch((e) => {
            toast({
                title: "Error archiving channel",
                description: e.message,
                status: "error",
                duration: 3000,
                isClosable: true
            })
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Archive this channel?</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <Stack spacing={4}>
                        {error && <AlertBanner status='error' heading={error.message}>{error.httpStatus} - {error.httpStatusText}</AlertBanner>}
                        <Text>Please understand that when you archive <strong>{channelData?.channel_name}</strong>:</Text>
                        <UnorderedList px='4' spacing={2}>
                            <ListItem>It will be removed from your channel list</ListItem>
                            <ListItem>No one will be able to send messages to this channel</ListItem>
                        </UnorderedList>
                        <Text>You will still be able to find the channel’s contents via search. And you can always unarchive the channel in the future, if you want.</Text>
                    </Stack>
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <Button variant='ghost' onClick={onClose}>Cancel</Button>
                        <Button colorScheme='red' type='submit' variant='outline' onClick={archiveChannel}>Archive Channel</Button>
                    </ButtonGroup>
                </ModalFooter>

            </ModalContent>
        </Modal>
    )
}