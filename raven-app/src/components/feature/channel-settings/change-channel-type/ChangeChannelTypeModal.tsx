import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { ErrorBanner } from '../../../layout/AlertBanner'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Button, Dialog, Flex, Text } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { useToast } from '@/hooks/useToast'

interface ChangeChannelTypeModalProps {
    onClose: () => void
    channelData: ChannelListItem
}

export const ChangeChannelTypeModal = ({ onClose, channelData }: ChangeChannelTypeModalProps) => {

    const { toast } = useToast()
    const { updateDoc, loading: updatingDoc, error } = useFrappeUpdateDoc()
    const new_channel_type = channelData?.type === 'Public' ? 'Private' : 'Public'

    const changeChannelType = (new_channel_type: 'Public' | 'Private') => {
        updateDoc("Raven Channel", channelData?.name ?? null, {
            type: new_channel_type
        }).then(() => {
            toast({
                title: "Channel type updated",
                variant: "success",
                duration: 1000,
            })
            onClose()
        })
    }

    return (
        <>
            <Dialog.Title>Change to a {new_channel_type.toLocaleLowerCase()} channel?</Dialog.Title>

            <Flex gap='2' direction='column' width='100%'>
                <ErrorBanner error={error} />
                {channelData?.type === 'Private' && <Flex direction='column' gap='4'>
                    <Text size='2'>Please understand that when you make <strong>{channelData?.channel_name}</strong> a public channel:</Text>
                    <ul className={'list-inside'}>
                        <li><Text size='1'>Anyone from your organisation can join this channel and view its message history.</Text></li>
                        <li><Text size='1'>If you make this channel private again, it willbe visible to anyone who has joined the channel up until that point.</Text></li>
                    </ul>
                </Flex>}
                {channelData?.type === 'Public' && <Flex direction='column' gap='4'>
                    <Text size='2'>Please understand that when you make <strong>{channelData?.channel_name}</strong> a private channel:</Text>
                    <ul className={'list-inside'}>
                        <li><Text size='1'>No changes will be made to the channel's history or members</Text></li>
                        <li><Text size='1'>All files shared in this channel will become private and will be accessible only to the channel members</Text></li>
                    </ul>
                </Flex>}
            </Flex>

            <Flex gap="3" mt="6" justify="end" align='center'>
                <Dialog.Close disabled={updatingDoc}>
                    <Button variant="soft" color="gray">Cancel</Button>
                </Dialog.Close>
                <Button onClick={() => changeChannelType(new_channel_type)} disabled={updatingDoc}>
                    {updatingDoc && <Loader />}
                    {updatingDoc ? "Saving" : `Change to ${new_channel_type.toLocaleLowerCase()}`}
                </Button>
            </Flex>
        </>
    )
}