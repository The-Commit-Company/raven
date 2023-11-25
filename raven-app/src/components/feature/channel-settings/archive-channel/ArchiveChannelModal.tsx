import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { ErrorBanner } from '../../../layout/AlertBanner'
import { useNavigate } from 'react-router-dom'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { AlertDialog, Flex, Text, Button } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { useToast } from '@/hooks/useToast'

interface ArchiveChannelModalProps {
    onClose: () => void,
    onCloseViewDetails: () => void,
    channelData: ChannelListItem
}

export const ArchiveChannelModal = ({ onClose, onCloseViewDetails, channelData }: ArchiveChannelModalProps) => {

    const { toast } = useToast()
    const { updateDoc, loading: archivingDoc, error } = useFrappeUpdateDoc()
    const navigate = useNavigate()

    const archiveChannel = () => {
        updateDoc('Raven Channel', channelData?.name ?? '', {
            is_archived: 1
        }).then(() => {
            onClose()
            onCloseViewDetails()
            navigate('/channel/general')
            toast({
                title: "Channel archived",
                variant: "success",
                duration: 1000,
            })
        })
    }

    return (
        <>
            <AlertDialog.Title>Archive this channel? </AlertDialog.Title>

            <Flex direction='column' gap='4'>
                <ErrorBanner error={error} />
                <Text size='2'>Please understand that when you archive <strong>{channelData?.channel_name}</strong>:</Text>
                <Flex direction='column'>
                    <ul className={'list-inside'}>
                        <li><Text size='1'>It will be removed from your channel list</Text></li>
                        <li><Text size='1'>No one will be able to send messages to this channel</Text></li>
                    </ul>
                </Flex>
                <Text size='2'>You will still be able to find the channel’s contents via search. And you can always unarchive the channel in the future, if you want.</Text>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                    <Button variant="soft" color="gray">
                        Cancel
                    </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                    <Button variant="solid" color="red" onClick={archiveChannel} disabled={archivingDoc}>
                        {archivingDoc && <Loader />}
                        {archivingDoc ? "Archiving" : "Archive"}
                    </Button>
                </AlertDialog.Action>
            </Flex>
        </>
    )
}