import { EditMessageModal } from "./EditMessageModal"
import { Dialog, IconButton, Tooltip } from '@radix-ui/themes'
import { AiOutlineEdit } from "react-icons/ai"
import { useState } from "react"
import { useModalContentStyle } from "@/hooks/useModalContentStyle"

export const EditMessageButton = ({ messageID, text }: { messageID: string, text: string }) => {

    const [open, setOpen] = useState(false)

    const onClose = () => {
        setOpen(false)
    }

    const contentClass = useModalContentStyle()

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Tooltip content='edit'>
                <Dialog.Trigger>
                    <IconButton
                        variant="ghost"
                        color="gray"
                        aria-label="edit message"
                        size='1'>
                        <AiOutlineEdit />
                    </IconButton>
                </Dialog.Trigger>
            </Tooltip>
            <Dialog.Content className={contentClass}>
                <EditMessageModal
                    onClose={onClose}
                    channelMessageID={messageID}
                    originalText={text}
                />
            </Dialog.Content>
        </Dialog.Root>
    )
}