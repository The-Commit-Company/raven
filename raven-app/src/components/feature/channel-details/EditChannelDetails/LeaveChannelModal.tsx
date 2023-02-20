import { Text, AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, ButtonGroup, HStack, useToast } from '@chakra-ui/react'
import { useFrappeDeleteDoc } from 'frappe-react-sdk'
import { useContext, useRef } from 'react'
import { BiHash, BiLockAlt } from 'react-icons/bi'
import { UserContext } from '../../../../utils/auth/UserProvider'
import { ChannelContext } from '../../../../utils/channel/ChannelProvider'
import { AlertBanner } from '../../../layout/AlertBanner'

interface LeaveChannelModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void
}

export const LeaveChannelModal = ({ isOpen, onClose }: LeaveChannelModalProps) => {

    const { channelData } = useContext(ChannelContext)
    const { currentUser } = useContext(UserContext)
    const cancelRef = useRef<HTMLButtonElement | null>(null)
    const { deleteDoc, error } = useFrappeDeleteDoc()
    const toast = useToast()

    const onSubmit = () => {
        let member_id = channelData[0].name + '-' + currentUser
        return deleteDoc('Raven Channel Member', member_id).then(() => {
            toast({
                title: 'channel left successfully',
                status: 'success',
                duration: 1500,
                position: 'bottom',
                variant: 'solid',
                isClosable: true
            })
            onClose()
        })
            .catch((e) => {
                toast({
                    title: 'Error: could not leave channel.',
                    status: 'error',
                    duration: 3000,
                    position: 'bottom',
                    variant: 'solid',
                    isClosable: true,
                    description: `${e.message}`
                })
            })
    }

    return (
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef} >
            <AlertDialogOverlay />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <HStack>
                        <Text>Leave </Text>
                        {channelData[0].type === 'Public' ? <BiHash /> : <BiLockAlt />}
                        <Text>{channelData[0].channel_name}?</Text>
                    </HStack>
                </AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>
                    {error && <AlertBanner status='error' heading={error.message}>{error.exception} - HTTP {error.httpStatus}</AlertBanner>}
                    <Text fontSize='sm'>When you leave a channel, you’ll no longer be able to see any of its messages. To rejoin this channel later, you’ll need to be invited.</Text>
                </AlertDialogBody>
                <AlertDialogFooter>
                    <ButtonGroup>
                        <Button ref={cancelRef} variant='ghost' onClick={() => onClose(false)}>Cancel</Button>
                        <Button colorScheme='red' onClick={onSubmit}>Leave</Button>
                    </ButtonGroup>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}