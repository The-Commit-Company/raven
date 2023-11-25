import { DeleteMessageModal } from './DeleteMessageModal'
import { useState } from 'react'
import { AlertDialog, IconButton, Tooltip } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { Trash2 } from 'lucide-react'

export const DeleteMessageButton = ({ messageID }: { messageID: string }) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <Tooltip content='delete'>
                <AlertDialog.Trigger>
                    <IconButton variant='soft' size='1' color='red' aria-label='delete message'>
                        <Trash2 size='14' />
                    </IconButton>
                </AlertDialog.Trigger>
            </Tooltip>
            <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
                <DeleteMessageModal
                    onClose={onClose}
                    channelMessageID={messageID}
                />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}