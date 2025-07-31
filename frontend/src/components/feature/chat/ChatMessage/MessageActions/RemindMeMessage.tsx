import { AlertDialog } from "@radix-ui/themes"
import { useCallback, useState } from "react"
import { Message } from "../../../../../../../types/Messaging/Message"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { RemindMeModal } from "../ActionModals/RemindMeModal"
import { Reminder } from "@/components/feature/reminder/Reminder"

export const useRemindMeMessage = () => {

    const [message, setMessage] = useState<null | Message>(null)

    const onClose = useCallback(() => {
        setMessage(null)
    }, [])

    return {
        message,
        setRemindMeMessage: setMessage,
        isOpen: message !== null,
        onClose
    }
}

interface RemindMeMessageDialogProps {
    message?: Message | null,
    reminder?: Reminder | null,
    isOpen: boolean,
    onClose: () => void
}
export const RemindMeMessageDialog = ({ message, reminder, isOpen, onClose }: RemindMeMessageDialogProps) => {
    return <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
        <AlertDialog.Content className={DIALOG_CONTENT_CLASS}>
            <RemindMeModal
                onClose={onClose}
                message={message ? message : undefined}
                reminder={reminder ? reminder : undefined}
            />
        </AlertDialog.Content>
    </AlertDialog.Root>

}