import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { DeleteChannelModal } from './DeleteChannelModal'
import { BsTrash } from 'react-icons/bs'
import { useState } from 'react'
import { AlertDialog, Button } from '@radix-ui/themes'
import { useModalContentStyle } from '@/hooks/useModalContentStyle'

interface DeleteChannelButtonProps {
    onClose: () => void,
    channelData: ChannelListItem
}

export const DeleteChannelButton = ({ onClose: onCloseParent, channelData }: DeleteChannelButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }
    const contentClass = useModalContentStyle()

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger>
                <Button color='red' variant='surface'>
                    <BsTrash fontSize={'1rem'} />
                    Delete channel
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content className={contentClass}>
                <DeleteChannelModal
                    onClose={onClose}
                    onCloseParent={onCloseParent}
                    channelData={channelData} />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}