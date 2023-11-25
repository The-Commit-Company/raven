import { EditMessageModal } from "./EditMessageModal"
import { Dialog, IconButton, Tooltip } from '@radix-ui/themes'
import { AiOutlineEdit } from "react-icons/ai"
import { useState } from "react"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"

export const EditMessageButton = ({ messageID, text }: { messageID: string, text: string }) => {

    const [open, setOpen] = useState(false)

    const onClose = () => {
        setOpen(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Tooltip content='edit'>
                <Dialog.Trigger>
                    <IconButton
                        variant='soft'
                        size='1'
                        color='gray'
                        aria-label='edit message'>
                        <AiOutlineEdit fontSize={'0.88rem'} />
                    </IconButton>
                </Dialog.Trigger>
            </Tooltip>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <EditMessageModal
                    onClose={onClose}
                    channelMessageID={messageID}
                    originalText={text}
                />
            </Dialog.Content>
        </Dialog.Root>
    )
}