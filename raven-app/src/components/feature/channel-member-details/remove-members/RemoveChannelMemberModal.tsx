import { useToast } from '@chakra-ui/react'
import { useFrappeDeleteDoc, useFrappeGetCall } from 'frappe-react-sdk'
import { ErrorBanner } from '../../../layout/AlertBanner'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChannelMembers } from '@/utils/channel/ChannelMembersProvider'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { AlertDialog, Button, Flex, Text } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'

interface RemoveChannelMemberModalProps {
    onClose: (refresh?: boolean) => void,
    user_id: string,
    channelData: ChannelListItem,
    channelMembers: ChannelMembers
    updateMembers: () => void
}

export const RemoveChannelMemberModal = ({ onClose, user_id, channelData, channelMembers, updateMembers }: RemoveChannelMemberModalProps) => {

    const { deleteDoc, error, loading: deletingDoc } = useFrappeDeleteDoc()
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

    const type = channelData?.type

    return (
        <>
            <AlertDialog.Title>
                <Text>
                    Remove {user_id && channelMembers[user_id]?.full_name} from
                    {ChannelIcon({ type, size: '1.5rem' })}
                    {channelData?.channel_name}?
                </Text>
            </AlertDialog.Title>

            <Flex direction={'column'} gap='2'>
                <ErrorBanner error={errorFetchingChannelMember} />
                <ErrorBanner error={error} />
                <Text size='1'>This person will no longer have access to the channel and can only rejoin by invitation.</Text>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                    <Button variant="soft" color="gray">
                        Cancel
                    </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                    <Button variant="solid" color="red" onClick={onSubmit} disabled={deletingDoc}>
                        {deletingDoc && <Loader />}
                        {deletingDoc ? "Removing" : "Remove"}
                    </Button>
                </AlertDialog.Action>
            </Flex>
        </>
    )
}