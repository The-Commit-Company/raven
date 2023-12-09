import { useFrappeDeleteDoc, useFrappeGetCall } from 'frappe-react-sdk'
import { ErrorBanner } from '../../../layout/AlertBanner'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChannelMembers } from '@/utils/channel/ChannelMembersProvider'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { AlertDialog, Button, Flex, Text } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { useToast } from '@/hooks/useToast'

interface RemoveChannelMemberModalProps {
    onClose: (refresh?: boolean) => void,
    user_id: string,
    channelData: ChannelListItem,
    channelMembers: ChannelMembers
    updateMembers: () => void
}

export const RemoveChannelMemberModal = ({ onClose, user_id, channelData, channelMembers, updateMembers }: RemoveChannelMemberModalProps) => {

    const { deleteDoc, error, loading: deletingDoc } = useFrappeDeleteDoc()
    const { toast } = useToast()

    const { data: member, error: errorFetchingChannelMember } = useFrappeGetCall<{ message: { name: string } }>('frappe.client.get_value', {
        doctype: "Raven Channel Member",
        filters: JSON.stringify({ channel_id: channelData?.name, user_id: user_id }),
        fieldname: JSON.stringify(["name"])
    }, undefined, {
        revalidateOnFocus: false
    })

    const onSubmit = async () => {
        return deleteDoc('Raven Channel Member', member?.message.name).then(() => {
            toast({
                title: 'Member removed successfully',
                variant: 'success',
                duration: 1000
            })
            updateMembers()
            onClose()
        })
    }

    return (
        <>
            <AlertDialog.Title>
                <Flex gap='1'>
                    <Text>Remove {user_id && channelMembers[user_id]?.full_name} from</Text>
                    <ChannelIcon type={channelData.type} className={'mt-1'} />
                    <Text>{channelData?.channel_name}?</Text>
                </Flex>
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