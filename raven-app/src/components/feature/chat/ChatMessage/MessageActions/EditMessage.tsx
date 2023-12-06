import { useCallback, useState } from "react"
import { Message, TextMessage } from "../../../../../../../types/Messaging/Message"
import { Dialog } from "@radix-ui/themes"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { EditMessageModal } from "@/components/feature/chat/ChatMessage/ActionModals/EditMessageModal"

export const useEditMessage = () => {
    const [message, setMessage] = useState<null | Message>(null)

    const onClose = useCallback(() => {
        setMessage(null)
    }, [])



    return {
        message,
        setEditMessage: setMessage,
        isOpen: message !== null,
        onClose
    }

}
interface EditMessageDialogProps {
    message: Message | null,
    isOpen: boolean,
    onClose: () => void
}
export const EditMessageDialog = ({ message, isOpen, onClose }: EditMessageDialogProps) => {


    return <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Content className={DIALOG_CONTENT_CLASS}>
            {message &&
                <EditMessageModal
                    message={message as TextMessage}
                    onClose={onClose} />
            }
        </Dialog.Content>
    </Dialog.Root>

}