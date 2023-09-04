import { AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, ButtonGroup, Checkbox, ListItem, Stack, Text, UnorderedList, useToast } from '@chakra-ui/react'
import { AlertBanner, ErrorBanner } from '../../../layout/AlertBanner'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFrappeDeleteDoc } from 'frappe-react-sdk'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'

type DeleteChannelModalProps = {
    isOpen: boolean,
    onClose: () => void,
    onCloseParent: () => void,
    channelData: ChannelListItem
}

export const DeleteChannelModal = ({ isOpen, onClose, onCloseParent, channelData }: DeleteChannelModalProps) => {

    const cancelRef = useRef<HTMLButtonElement | null>(null)
    const { deleteDoc, error, loading, reset } = useFrappeDeleteDoc()

    const handleClose = () => {
        onClose()
        reset()
    }

    const toast = useToast()
    const navigate = useNavigate()

    const onSubmit = () => {
        if (channelData?.name) {
            deleteDoc('Raven Channel', channelData.name)
                .then(() => {
                    onClose()
                    onCloseParent()
                    localStorage.removeItem('ravenLastChannel')
                    navigate('/channel')
                    toast({
                        title: 'Success',
                        description: 'Channel deleted successfully',
                        status: 'success',
                        duration: 2000,
                        isClosable: true,
                    })
                }).catch(() => {
                    toast({
                        title: 'Error',
                        description: 'Error deleting channel',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    })
                })
        }
    }

    const [allowDelete, setAllowDelete] = useState(false)

    return (
        <AlertDialog isOpen={isOpen} onClose={handleClose} leastDestructiveRef={cancelRef} size='3xl'>
            <AlertDialogOverlay />
            <AlertDialogContent>
                <AlertDialogHeader>
                    Delete this channel?
                </AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>
                    <Stack spacing={4}>
                        <ErrorBanner error={error} />
                        <AlertBanner status='warning' heading='This action is permanent.' />
                        <Text>When you delete a channel, all messages from this channel will be removed immediately.</Text>
                        <Stack>
                            <UnorderedList>
                                <ListItem>All messages, including files and images will be removed</ListItem>
                                <ListItem>You can archive this channel instead to preserve your messages</ListItem>
                            </UnorderedList>
                        </Stack>
                        <Checkbox isChecked={allowDelete} onChange={() => setAllowDelete(!allowDelete)}>Yes, I understand, permanently delete this channel</Checkbox>
                    </Stack>
                </AlertDialogBody>
                <AlertDialogFooter>
                    <ButtonGroup>
                        <Button ref={cancelRef} variant='ghost' onClick={handleClose}>Cancel</Button>
                        <Button colorScheme='red' onClick={onSubmit} isDisabled={!allowDelete} isLoading={loading}>Delete</Button>
                    </ButtonGroup>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}