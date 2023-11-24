import { useToast } from '@chakra-ui/react'
import { ErrorBanner } from '../../../layout/AlertBanner'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFrappeDeleteDoc } from 'frappe-react-sdk'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { AlertDialog, Button, Callout, Checkbox, Flex, Text } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

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

    const toast = useToast()
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
                        title: 'Success',
                        description: 'Channel deleted successfully',
                        status: 'success',
                        duration: 2000,
                        isClosable: true,
                    })
                }).catch(() => {
                    toast({
                        title: 'Error',
                        description: 'Error deleting channel',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
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
                        <ExclamationTriangleIcon />
                    </Callout.Icon>
                    <Callout.Text size='1'>
                        This action is permanent and cannot be undone.
                    </Callout.Text>
                </Callout.Root>
                <Text size='2'>When you delete a channel, all messages from this channel will be removed immediately.</Text>
                <Flex direction='column'>
                    <ul className={'list-inside'}>
                        <li><Text size='1'>All messages, including files and images will be removed</Text></li>
                        <li><Text size='1'>You can archive this channel instead to preserve your messages</Text></li>
                    </ul>
                </Flex>
                <Flex gap="2" align={'center'}>
                    <Checkbox onClick={() => setAllowDelete(!allowDelete)} color='red' />
                    <Text size='2'>Yes, I understand, permanently delete this channel</Text>
                </Flex>
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