import { useFrappeUpdateDoc } from 'frappe-react-sdk'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { useNavigate } from 'react-router-dom'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { AlertDialog, Flex, Text, Button, Dialog } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { toast } from 'sonner'
import { Fragment } from 'react'

interface ArchiveChannelModalProps {
    onClose: () => void,
    onCloseViewDetails: () => void,
    channelData: ChannelListItem,
    isDrawer?: boolean
}

export const ArchiveChannelModal = ({ onClose, onCloseViewDetails, channelData, isDrawer }: ArchiveChannelModalProps) => {

    const { updateDoc, loading: archivingDoc, error } = useFrappeUpdateDoc()
    const navigate = useNavigate()

    const archiveChannel = () => {
        updateDoc('Raven Channel', channelData?.name ?? '', {
            is_archived: 1
        }).then(() => {
            onClose()
            onCloseViewDetails()
            navigate(`/${channelData.workspace}`)
            toast('Channel archived')
        })
    }
    const Title = isDrawer ? Dialog.Title : AlertDialog.Title
    const DialogCancel = isDrawer ? Fragment : AlertDialog.Cancel
    const DialogAction = isDrawer ? Fragment : AlertDialog.Action

    return (
        <>
            {isDrawer ?
                <Title>Archive this channel? </Title>
                :
                <AlertDialog.Title>Archive this channel? </AlertDialog.Title>
            }

            <Flex direction='column' gap='4'>
                <ErrorBanner error={error} />
                <Text size='2'>Please understand that when you archive <strong>{channelData?.channel_name}</strong>:</Text>
                <Flex direction='column'>
                    <ul className={'list-inside'}>
                        <li><Text size='2'>It will be removed from your channel list</Text></li>
                        <li><Text size='2'>No one will be able to send messages to this channel</Text></li>
                    </ul>
                </Flex>
                <Text size='2'>You will still be able to find the channel’s contents via search. And you can always unarchive the channel in the future, if you want.</Text>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <DialogCancel>
                    <Button variant="soft" color="gray">
                        Cancel
                    </Button>
                </DialogCancel>
                <DialogAction>
                    <Button variant="solid" color="red" onClick={archiveChannel} disabled={archivingDoc}>
                        {archivingDoc && <Loader className="text-white" />}
                        {archivingDoc ? "Archiving" : "Archive"}
                    </Button>
                </DialogAction>
            </Flex>
        </>
    )
}