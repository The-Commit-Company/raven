import { Text, AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, ButtonGroup, HStack, useToast, Icon } from '@chakra-ui/react'
import { useFrappeDeleteDoc, useFrappeGetCall } from 'frappe-react-sdk'
import { useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../../../utils/auth/UserProvider'
import { ErrorBanner } from '../../../layout/AlertBanner'
import { ChannelListContext, ChannelListContextType, ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChannelIcon, getChannelIcon } from '@/utils/layout/channelIcon'

interface LeaveChannelModalProps {
    isOpen: boolean,
    onClose: () => void,
    channelData: ChannelListItem,
    closeDetailsModal: () => void
}

export const LeaveChannelModal = ({ isOpen, onClose, channelData, closeDetailsModal }: LeaveChannelModalProps) => {

    const { currentUser } = useContext(UserContext)
    const cancelRef = useRef<HTMLButtonElement | null>(null)
    const { deleteDoc, error } = useFrappeDeleteDoc()
    const toast = useToast()
    const navigate = useNavigate()

    const { data: channelMember } = useFrappeGetCall<{ message: { name: string } }>('frappe.client.get_value', {
        doctype: "Raven Channel Member",
        filters: JSON.stringify({ channel_id: channelData?.name, user_id: currentUser }),
        fieldname: JSON.stringify(["name"])
    }, undefined, {
        revalidateOnFocus: false
    })

    const { mutate } = useContext(ChannelListContext) as ChannelListContextType

    const onSubmit = () => {
        return deleteDoc('Raven Channel Member', channelMember?.message.name).then(() => {
            toast({
                title: 'Channel left successfully',
                status: 'success',
                duration: 1500,
                position: 'bottom',
                variant: 'solid',
                isClosable: true
            })
            onClose()
            mutate()
            navigate('../general')
            closeDetailsModal()
        }).catch((e) => {
            toast({
                title: 'Error: could leave channel.',
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
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef} size='2xl'>
            <AlertDialogOverlay />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <HStack>
                        <Text>Leave </Text>
                        <ChannelIcon type={channelData?.type} className={'mt-0.5'} />
                        <Text>{channelData?.channel_name}?</Text>
                    </HStack>
                </AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>
                    <ErrorBanner error={error} />
                    {channelData?.type === 'Private' ?
                        <Text fontSize='sm'>When you leave this channel, you’ll no longer be able to see any of its messages. To rejoin, you’ll need to be invited.</Text> :
                        <Text fontSize='sm'>When you leave this channel, you’ll no longer be able to send anymore messages, you will have to rejoin the channel to continue participation.</Text>
                    }
                </AlertDialogBody>
                <AlertDialogFooter>
                    <ButtonGroup>
                        <Button ref={cancelRef} variant='ghost' onClick={onClose}>Cancel</Button>
                        <Button colorScheme='red' onClick={onSubmit}>Leave</Button>
                    </ButtonGroup>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}