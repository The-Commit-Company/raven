import { Dialog } from '@radix-ui/themes'
import { useCallback, useState } from 'react'
import { Message } from '../../../../../../../types/Messaging/Message'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent } from '@/components/layout/Drawer'
import AttachFileToDocumentModal from '../ActionModals/AttachFileToDocumentModal'

type Props = {
    file: string
}

export const useAttachFileToDocument = (onModalClose?: VoidFunction) => {

    const [message, setMessage] = useState<null | Message>(null)

    const onClose = useCallback(() => {
        setMessage(null)
        onModalClose?.()
    }, [onModalClose])

    return {
        message,
        setAttachDocument: setMessage,
        isOpen: message !== null,
        onClose
    }

}


interface AttacFileToDocumentDialogProps {
    message: Message | null,
    isOpen: boolean,
    onClose: () => void
}
const AttachFileToDocumentDialog = ({ message, isOpen, onClose }: AttacFileToDocumentDialogProps) => {

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Content className={'static'}>
                {message &&
                    <AttachFileToDocumentModal
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
                        <AttachFileToDocumentModal
                            message={message}
                            onClose={onClose} />
                    }
                </div>
            </DrawerContent>
        </Drawer>
    }
}

export default AttachFileToDocumentDialog