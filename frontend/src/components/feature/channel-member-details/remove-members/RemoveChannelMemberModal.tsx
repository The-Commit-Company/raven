import { useFrappeDeleteDoc, useFrappeGetCall, useSWRConfig } from 'frappe-react-sdk'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { AlertDialog, Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { useParams } from 'react-router-dom'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { toast } from 'sonner'
import { Member } from '@/hooks/fetchers/useFetchChannelMembers'
import { useIsDesktop } from '@/hooks/useMediaQuery'

interface RemoveChannelMemberModalProps {
    onClose: () => void,
    member: Member | null
}

export const RemoveChannelMemberModal = ({ onClose, member }: RemoveChannelMemberModalProps) => {

    const { deleteDoc, error, loading: deletingDoc } = useFrappeDeleteDoc()

    const { channelID } = useParams<{ channelID: string }>()
    const { channel } = useCurrentChannelData(channelID ?? '')

    const { mutate } = useSWRConfig()
    const channelData = channel?.channelData

    const { data: memberInfo, error: errorFetchingChannelMember } = useFrappeGetCall<{ message: { name: string } }>('frappe.client.get_value', {
        doctype: "Raven Channel Member",
        filters: JSON.stringify({ channel_id: channelID, user_id: member?.name }),
        fieldname: JSON.stringify(["name"])
    }, undefined, {
        revalidateOnFocus: false
    })

    const onSubmit = async () => {
        return deleteDoc('Raven Channel Member', memberInfo?.message.name).then(() => {
            toast.success(`Removed`)
            onClose()
            mutate(["channel_members", channelID])
        })
    }

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return (
            <>
                <AlertDialog.Title>
                    <Flex gap='1'>
                        <Text>Remove {member && member?.full_name} from</Text>
                        {channelData?.type && <ChannelIcon type={channelData?.type} className={'mt-1'} />}
                        <Text>{channelData?.channel_name}?</Text>
                    </Flex>
                </AlertDialog.Title>

                <Flex direction={'column'} gap='2'>
                    <ErrorBanner error={errorFetchingChannelMember} />
                    <ErrorBanner error={error} />
                    <Text size='2'>This person will no longer have access to the channel.</Text>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <AlertDialog.Cancel>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                        <Button variant="solid" color="red" onClick={onSubmit} disabled={deletingDoc}>
                            {deletingDoc && <Loader className="text-white" />}
                            {deletingDoc ? "Removing" : "Remove"}
                        </Button>
                    </AlertDialog.Action>
                </Flex>
            </>
        )
    } else {
        return <>
            <Dialog.Title>
                <Flex gap='1'>
                    <Text>Remove {member && member?.full_name} from</Text>
                    {channelData?.type && <ChannelIcon type={channelData?.type} className={'mt-1'} />}
                    <Text>{channelData?.channel_name}?</Text>
                </Flex>
            </Dialog.Title>

            <Flex direction={'column'} gap='2'>
                <ErrorBanner error={errorFetchingChannelMember} />
                <ErrorBanner error={error} />
                <Text size='1'>This person will no longer have access to the channel and can only rejoin by invitation.</Text>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <Button variant="soft" color="gray" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="solid" color="red" onClick={onSubmit} disabled={deletingDoc}>
                    {deletingDoc && <Loader className="text-white" />}
                    {deletingDoc ? "Removing" : "Remove"}
                </Button>
            </Flex>
        </>
    }


}