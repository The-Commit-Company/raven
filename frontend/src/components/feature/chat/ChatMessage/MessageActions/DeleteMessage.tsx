import { useCallback, useState } from "react"
import { Message } from "../../../../../../../types/Messaging/Message"
import { AlertDialog } from "@radix-ui/themes"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { DeleteMessageModal } from "@/components/feature/chat/ChatMessage/ActionModals/DeleteMessageModal"

export const useDeleteMessage = (onModalClose?: VoidFunction) => {

    const [message, setMessage] = useState<null | Message>(null)

    const onClose = useCallback(() => {
        setMessage(null)
        onModalClose?.()
    }, [onModalClose])

    return {
        message,
        setDeleteMessage: setMessage,
        isOpen: message !== null,
        onClose
    }

}
interface DeleteMessageDialogProps {
    message: Message | null,
    isOpen: boolean,
    onClose: () => void
}
export const DeleteMessageDialog = ({ message, isOpen, onClose }: DeleteMessageDialogProps) => {
    return <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
        <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
            {message &&
                <DeleteMessageModal
                    onClose={onClose}
                    message={message}
                />
            }
        </AlertDialog.Content>
    </AlertDialog.Root>

}