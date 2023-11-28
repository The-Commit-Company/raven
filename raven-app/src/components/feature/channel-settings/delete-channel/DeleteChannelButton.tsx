import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { DeleteChannelModal } from './DeleteChannelModal'
import { BiTrash } from 'react-icons/bi'
import { useState } from 'react'
import { AlertDialog, Button } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'

interface DeleteChannelButtonProps {
    onClose: () => void,
    channelData: ChannelListItem
}

export const DeleteChannelButton = ({ onClose: onCloseParent, channelData }: DeleteChannelButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger>
                <Button color='red' variant='surface'>
                    <BiTrash />
                    Delete channel
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
                <DeleteChannelModal
                    onClose={onClose}
                    onCloseParent={onCloseParent}
                    channelData={channelData} />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}