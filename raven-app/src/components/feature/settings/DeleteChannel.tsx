import { AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, ButtonGroup, Checkbox, ListItem, Stack, Text, UnorderedList, useToast } from '@chakra-ui/react'
import { AlertBanner } from '../../layout/AlertBanner'
import { useContext, useRef, useState } from 'react'
import { useFrappePostCall } from 'frappe-react-sdk'
import { ChannelContext } from '../../../utils/channel/ChannelProvider'
import { useNavigate } from 'react-router-dom'

type DeleteChannelProps = {
    isOpen: boolean,
    onClose: () => void
}

export const DeleteChannel = ({ isOpen, onClose }: DeleteChannelProps) => {

    const { channelData } = useContext(ChannelContext)
    const cancelRef = useRef<HTMLButtonElement | null>(null)
    const { call, error } = useFrappePostCall('raven.raven_channel_management.doctype.raven_channel.raven_channel.delete_channel')
    const toast = useToast()
    const navigate = useNavigate()

    const onSubmit = () => {
        if (channelData?.name) {
            call({
                channel_id: channelData.name
            }).then(() => {
                onClose()
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
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef} size='3xl'>
            <AlertDialogOverlay />
            <AlertDialogContent>
                <AlertDialogHeader>
                    Delete this channel?
                </AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>
                    <Stack spacing={4}>
                        {error && <AlertBanner status='error' heading={error.message}>{error.exception} - HTTP {error.httpStatus}</AlertBanner>}
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
                        <Button ref={cancelRef} variant='ghost' onClick={onClose}>Cancel</Button>
                        <Button colorScheme='red' onClick={onSubmit} isDisabled={!allowDelete}>Delete</Button>
                    </ButtonGroup>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}