import { useFrappeDeleteDoc, useFrappeGetCall } from 'frappe-react-sdk'
import { useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../../../utils/auth/UserProvider'
import { ErrorBanner } from '../../../layout/AlertBanner'
import { ChannelListContext, ChannelListContextType, ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { AlertDialog, Button, Flex, Text } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { useToast } from '@/hooks/useToast'

interface LeaveChannelModalProps {
    onClose: () => void,
    channelData: ChannelListItem,
    closeDetailsModal: () => void
}

export const LeaveChannelModal = ({ onClose, channelData, closeDetailsModal }: LeaveChannelModalProps) => {

    const { currentUser } = useContext(UserContext)
    const { deleteDoc, loading: deletingDoc, error } = useFrappeDeleteDoc()
    const { toast } = useToast()
    const navigate = useNavigate()

    const { data: channelMember } = useFrappeGetCall<{ message: { name: string } }>('frappe.client.get_value', {
        doctype: "Raven Channel Member",
        filters: JSON.stringify({ channel_id: channelData?.name, user_id: currentUser }),
        fieldname: JSON.stringify(["name"])
    }, undefined, {
        revalidateOnFocus: false
    })

    const { mutate } = useContext(ChannelListContext) as ChannelListContextType

    const onSubmit = async () => {
        return deleteDoc('Raven Channel Member', channelMember?.message.name).then(() => {
            toast({
                title: 'You have left the channel',
            })
            onClose()
            mutate()
            navigate('../general')
            closeDetailsModal()
        }).catch((e) => {
            toast({
                title: 'Error: Could leave channel.',
                variant: 'destructive',
                description: `${e.message}`
            })
        })
    }

    return (
        <>
            <AlertDialog.Title>
                <Flex gap='1'>
                    <Text>Leave </Text>
                    <ChannelIcon type={channelData?.type} className={'mt-1'} />
                    <Text>{channelData?.channel_name}?</Text>
                </Flex>
            </AlertDialog.Title>

            <Flex direction={'column'} gap='2'>
                <ErrorBanner error={error} />
                {channelData?.type === 'Private' ?
                    <Text size='1'>When you leave this channel, you’ll no longer be able to see any of its messages. To rejoin, you’ll need to be invited.</Text> :
                    <Text size='1'>When you leave this channel, you’ll no longer be able to send anymore messages, you will have to rejoin the channel to continue participation.</Text>
                }
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
                        {deletingDoc ? "Leaving" : "Leave"}
                    </Button>
                </AlertDialog.Action>
            </Flex>
        </>
    )
}