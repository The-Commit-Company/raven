import { useCallback, useState } from "react"
import { Message, TextMessage } from "../../../../../../../types/Messaging/Message"
import { Dialog } from "@radix-ui/themes"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { EditMessageModal } from "@/components/feature/chat/ChatMessage/ActionModals/EditMessageModal"
import { useIsDesktop } from "@/hooks/useMediaQuery"
import { Drawer, DrawerContent } from "@/components/layout/Drawer"

export const useEditMessage = (onModalClose?: VoidFunction) => {
    const [message, setMessage] = useState<null | Message>(null)

    const onClose = useCallback(() => {
        setMessage(null)
        onModalClose?.()
    }, [onModalClose])



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

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                {message &&
                    <EditMessageModal
                        message={message as TextMessage}
                        onClose={onClose} />
                }
            </Dialog.Content>
        </Dialog.Root>
    } else {
        return <Drawer open={isOpen} onClose={onClose}>
            <DrawerContent>
                <div className="pb-24">
                    {message &&
                        <EditMessageModal
                            message={message as TextMessage}
                            onClose={onClose} />
                    }
                </div>

            </DrawerContent>
        </Drawer>
    }



}