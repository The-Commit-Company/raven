import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { Dialog } from "@radix-ui/themes"
import { useState, useCallback } from "react"
import { Message, TextMessage } from "../../../../../../../types/Messaging/Message"
import ForwardMessageModal from "../ActionModals/ForwardMessageModal"

export const useForwardMessage = () => {

    const [message, setMessage] = useState<null | Message>(null)

    const onClose = useCallback(() => {
        setMessage(null)
    }, [])

    return {
        message,
        setForwardMessage: setMessage,
        isOpen: message !== null,
        onClose
    }

}

interface ForwardMessageDialogProps {
    message: Message | null,
    isOpen: boolean,
    onClose: () => void
}

export const ForwardMessageDialog = ({ message, isOpen, onClose }: ForwardMessageDialogProps) => {
    return <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Content className={DIALOG_CONTENT_CLASS}>
            {message &&
                <ForwardMessageModal
                    message={message as TextMessage}
                    onClose={onClose} />
            }
        </Dialog.Content>
    </Dialog.Root>
}