import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { Dialog } from "@radix-ui/themes"
import { useState, useCallback } from "react"
import { Message } from "../../../../../../../types/Messaging/Message"
import ForwardMessageModal from "../ActionModals/ForwardMessageModal"
import { useIsDesktop } from "@/hooks/useMediaQuery"
import { Drawer, DrawerContent } from "@/components/layout/Drawer"
import clsx from "clsx"

export const useForwardMessage = (onModalClose?: VoidFunction) => {

    const [message, setMessage] = useState<null | Message>(null)

    const onClose = useCallback(() => {
        setMessage(null)
        onModalClose?.()
    }, [onModalClose])

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

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Content className={'static'}>
                {message &&
                    <ForwardMessageModal
                        message={message}
                        onClose={onClose} />
                }
            </Dialog.Content>
        </Dialog.Root>
    } else {
        return <Drawer open={isOpen} onClose={onClose}>
            <DrawerContent>
                <div className="pb-24">
                    {message &&
                        <ForwardMessageModal
                            message={message}
                            onClose={onClose} />
                    }
                </div>
            </DrawerContent>
        </Drawer>
    }
}