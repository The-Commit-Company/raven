import { Text, AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, ButtonGroup, HStack, useToast } from '@chakra-ui/react'
import { useFrappeDeleteDoc, useFrappeGetCall } from 'frappe-react-sdk'
import { useRef } from 'react'
import { BiHash, BiLockAlt } from 'react-icons/bi'
import { ErrorBanner } from '../../../layout/AlertBanner'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChannelMembers } from '@/utils/channel/ChannelMembersProvider'

interface RemoveChannelMemberModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void,
    user_id: string,
    channelData: ChannelListItem,
    channelMembers: ChannelMembers
    updateMembers: () => void
}

export const RemoveChannelMemberModal = ({ isOpen, onClose, user_id, channelData, channelMembers, updateMembers }: RemoveChannelMemberModalProps) => {

    const cancelRef = useRef<HTMLButtonElement | null>(null)
    const { deleteDoc, error } = useFrappeDeleteDoc()
    const toast = useToast()

    const { data: member, error: errorFetchingChannelMember } = useFrappeGetCall<{ message: { name: string } }>('frappe.client.get_value', {
        doctype: "Raven Channel Member",
        filters: JSON.stringify({ channel_id: channelData?.name, user_id: user_id }),
        fieldname: JSON.stringify(["name"])
    }, undefined, {
        revalidateOnFocus: false
    })

    const onSubmit = () => {
        return deleteDoc('Raven Channel Member', member?.message.name).then(() => {
            toast({
                title: 'Member removed successfully',
                status: 'success',
                duration: 1500,
                position: 'bottom',
                variant: 'solid',
                isClosable: true
            })
            updateMembers()
            onClose()
        }).catch((e) => {
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
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef} size='2xl'>
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
                    <ErrorBanner error={errorFetchingChannelMember} />
                    <ErrorBanner error={error} />
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