import { VscTrash } from 'react-icons/vsc'
import { DeleteMessageModal } from './DeleteMessageModal'
import { useState } from 'react'
import { useModalContentStyle } from '@/hooks/useModalContentStyle'
import { AlertDialog, IconButton, Tooltip } from '@radix-ui/themes'

export const DeleteMessageButton = ({ messageID }: { messageID: string }) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }
    const contentClass = useModalContentStyle()

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <Tooltip content='delete'>
                <AlertDialog.Trigger>
                    <IconButton variant='soft' size='1' color='red' aria-label='delete message'>
                        <VscTrash fontSize={'0.9rem'} />
                    </IconButton>
                </AlertDialog.Trigger>
            </Tooltip>
            <AlertDialog.Content className={contentClass}>
                <DeleteMessageModal
                    onClose={onClose}
                    channelMessageID={messageID}
                />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}