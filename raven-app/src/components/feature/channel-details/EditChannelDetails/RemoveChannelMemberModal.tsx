import { Text, AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, ButtonGroup, HStack, useToast } from '@chakra-ui/react'
import { useFrappeDeleteDoc, useFrappeGetCall } from 'frappe-react-sdk'
import { useContext, useRef } from 'react'
import { BiHash, BiLockAlt } from 'react-icons/bi'
import { ChannelContext } from '../../../../utils/channel/ChannelProvider'
import { AlertBanner } from '../../../layout/AlertBanner'

interface RemoveChannelMemberModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void,
    user_id: string
}

export const RemoveChannelMemberModal = ({ isOpen, onClose, user_id }: RemoveChannelMemberModalProps) => {

    const { channelData, channelMembers } = useContext(ChannelContext)
    const cancelRef = useRef<HTMLButtonElement | null>(null)
    const { deleteDoc, error } = useFrappeDeleteDoc()
    const toast = useToast()

    const { data: channelMember, error: errorFetchingChannelMember } = useFrappeGetCall<{ message: { name: string } }>('frappe.client.get_value', {
        doctype: "Raven Channel Member",
        filters: JSON.stringify({ channel_id: channelData?.name, user_id: user_id }),
        fieldname: JSON.stringify(["name"])
    })

    const onSubmit = () => {
        return deleteDoc('Raven Channel Member', channelMember?.message.name).then(() => {
            toast({
                title: 'Member removed successfully',
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
                    title: 'Error: could not remove member.',
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
                        <Text>Remove {user_id && channelMembers[user_id]?.full_name} from </Text>
                        {channelData?.type === 'Public' ? <BiHash /> : <BiLockAlt />}
                        <Text>{channelData?.channel_name}?</Text>
                    </HStack>
                </AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>
                    {error && <AlertBanner status='error' heading={error.message}>{error.exception} - HTTP {error.httpStatus}</AlertBanner>}
                    <Text fontSize='sm'>This person will no longer have access to the channel and can only rejoin by invitation.</Text>
                </AlertDialogBody>
                <AlertDialogFooter>
                    <ButtonGroup>
                        <Button ref={cancelRef} variant='ghost' onClick={() => onClose(false)}>Cancel</Button>
                        <Button colorScheme='red' onClick={onSubmit}>Remove</Button>
                    </ButtonGroup>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}