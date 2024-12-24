import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFrappeDeleteDoc, useSWRConfig } from 'frappe-react-sdk'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { AlertDialog, Button, Callout, Checkbox, Dialog, Flex, Text } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { FiAlertTriangle } from 'react-icons/fi'
import { toast } from 'sonner'

type DeleteChannelModalProps = {
    onClose: () => void,
    onCloseParent: () => void,
    channelData: ChannelListItem,
    isDrawer?: boolean
}

export const DeleteChannelModal = ({ onClose, onCloseParent, isDrawer, channelData }: DeleteChannelModalProps) => {

    const { mutate } = useSWRConfig()

    const { deleteDoc, error, loading: deletingDoc, reset } = useFrappeDeleteDoc()

    const handleClose = () => {
        onClose()
        reset()
    }

    const navigate = useNavigate()

    const lastWorkspace = localStorage.getItem('ravenLastWorkspace')

    const onSubmit = () => {
        if (channelData?.name) {
            deleteDoc('Raven Channel', channelData.name)
                .then(() => {
                    // Mutate the channel members cache
                    mutate(["channel_members", channelData.name], undefined, { revalidate: false })
                    onClose()
                    onCloseParent()
                    localStorage.removeItem('ravenLastChannel')
                    if (lastWorkspace) {
                        navigate(`/${lastWorkspace}`)
                    } else {
                        navigate('/')
                    }
                    toast(`Channel ${channelData.channel_name} deleted.`)
                })
        }
    }

    const [allowDelete, setAllowDelete] = useState(false)

    const Title = isDrawer ? Dialog.Title : AlertDialog.Title
    const DialogCancel = isDrawer ? Fragment : AlertDialog.Cancel
    const DialogAction = isDrawer ? Fragment : AlertDialog.Action

    return (
        <>
            <Title>Delete this channel?</Title>

            <Flex direction='column' gap='4'>
                <ErrorBanner error={error} />
                <Callout.Root color="red" size='1'>
                    <Callout.Icon>
                        <FiAlertTriangle size='18' />
                    </Callout.Icon>
                    <Callout.Text>
                        This action is permanent and cannot be undone.
                    </Callout.Text>
                </Callout.Root>
                <Text size='2'>When you delete a channel, all messages from this channel will be removed immediately.</Text>
                <Flex direction='column'>
                    <ul className={'list-inside'}>
                        <li><Text as='span' size='2'>All messages, including files and images will be removed</Text></li>
                        <li><Text as='span' size='2'>You can archive this channel instead to preserve your messages</Text></li>
                    </ul>
                </Flex>
                <Text size='2' as='label'>
                    <Flex gap="2" align={'center'}>
                        <Checkbox onClick={() => setAllowDelete(!allowDelete)} color='red' />
                        Yes, I understand, permanently delete this channel
                    </Flex>
                </Text>
            </Flex>

            <Flex gap="3" mt="4" justify="end">

                <DialogCancel>
                    <Button variant="soft" color="gray" onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogCancel>
                <DialogAction>
                    <Button variant="solid" color="red" onClick={onSubmit} disabled={!allowDelete || deletingDoc}>
                        {deletingDoc && <Loader className="text-white" />}
                        {deletingDoc ? "Deleting" : "Delete"}
                    </Button>
                </DialogAction>

            </Flex>
        </>
    )
}