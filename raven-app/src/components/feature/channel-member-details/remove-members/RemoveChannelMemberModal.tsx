import { useFrappeDeleteDoc } from 'frappe-react-sdk'
import { ErrorBanner } from '../../../layout/AlertBanner'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { AlertDialog, Button, Flex, Text } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { useToast } from '@/hooks/useToast'
import { Member } from '@/utils/channel/ChannelMembersProvider'

interface RemoveChannelMemberModalProps {
    onClose: (refresh?: boolean) => void,
    user: Member,
    channelData: ChannelListItem,
    updateMembers: () => void,
    memberID: string
}

export const RemoveChannelMemberModal = ({ onClose, user, channelData, updateMembers, memberID }: RemoveChannelMemberModalProps) => {

    const { deleteDoc, error, loading: deletingDoc } = useFrappeDeleteDoc()
    const { toast } = useToast()

    const onSubmit = async () => {
        return deleteDoc('Raven Channel Member', memberID).then(() => {
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
                    <Text>Remove {user && user?.full_name} from</Text>
                    <ChannelIcon type={channelData.type} className={'mt-1'} />
                    <Text>{channelData?.channel_name}?</Text>
                </Flex>
            </AlertDialog.Title>

            <Flex direction={'column'} gap='2'>
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