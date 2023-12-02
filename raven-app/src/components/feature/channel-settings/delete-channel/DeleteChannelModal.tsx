import { ErrorBanner } from '../../../layout/AlertBanner'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFrappeDeleteDoc } from 'frappe-react-sdk'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { AlertDialog, Button, Callout, Checkbox, Flex, Text } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { useToast } from '@/hooks/useToast'
import { FiAlertTriangle } from 'react-icons/fi'

type DeleteChannelModalProps = {
    onClose: () => void,
    onCloseParent: () => void,
    channelData: ChannelListItem
}

export const DeleteChannelModal = ({ onClose, onCloseParent, channelData }: DeleteChannelModalProps) => {

    const { deleteDoc, error, loading: deletingDoc, reset } = useFrappeDeleteDoc()

    const handleClose = () => {
        onClose()
        reset()
    }

    const { toast } = useToast()
    const navigate = useNavigate()

    const onSubmit = () => {
        if (channelData?.name) {
            deleteDoc('Raven Channel', channelData.name)
                .then(() => {
                    onClose()
                    onCloseParent()
                    localStorage.removeItem('ravenLastChannel')
                    navigate('/channel')
                    toast({
                        title: `Channel ${channelData.name} deleted`,
                        variant: 'success',
                    })
                })
        }
    }

    const [allowDelete, setAllowDelete] = useState(false)

    return (
        <>
            <AlertDialog.Title>
                Delete this channel?
            </AlertDialog.Title>

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
                <AlertDialog.Cancel>
                    <Button variant="soft" color="gray" onClick={handleClose}>
                        Cancel
                    </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                    <Button variant="solid" color="red" onClick={onSubmit} disabled={!allowDelete || deletingDoc}>
                        {deletingDoc && <Loader />}
                        {deletingDoc ? "Deleting" : "Delete"}
                    </Button>
                </AlertDialog.Action>
            </Flex>
        </>
    )
}