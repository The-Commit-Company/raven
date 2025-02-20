import { useCallback, useState, useMemo } from "react"
import { Message } from "../../../../../../../types/Messaging/Message"
import { Dialog } from "@radix-ui/themes"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"
import { useIsDesktop } from "@/hooks/useMediaQuery"
import { Drawer, DrawerContent } from "@/components/layout/Drawer"
import { ReactionObject } from "../MessageReactions"
import { ReactionAnalyticsModal } from "../ActionModals/ReactionAnalyticsModal"

export const useMessageReactionAnalytics = (onModalClose?: VoidFunction) => {
    const [message, setMessage] = useState<null | Message>(null)

    const message_reactions = message?.message_reactions;

    const reactions: ReactionObject[] = useMemo(() => {
        //Parse the string to a JSON object and get an array of reactions
        const parsed_json = JSON.parse(message_reactions ?? '{}') as Record<string, ReactionObject>
        return Object.entries(parsed_json).map(([key, value]) => ({
            ...value,
            emoji_name: key
        }))
    }, [message_reactions])

    const onClose = useCallback(() => {
        setMessage(null)
        onModalClose?.()
    }, [onModalClose])

    return {
        reactions,
        message,
        onClose,
        isOpen: message !== null,
        setReactionMessage: setMessage
    }
}

export interface ReactionAnalyticsDialogProps {
    isOpen?: boolean,
    onClose?: VoidFunction,
    reactions: ReactionObject[]
}
export const ReactionAnalyticsDialog = ({ isOpen, onClose, ...reactionProps }: ReactionAnalyticsDialogProps) => {

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Content className={`${DIALOG_CONTENT_CLASS} w-[450px]`}>
                <ReactionAnalyticsModal {...reactionProps} />
            </Dialog.Content>
        </Dialog.Root>
    } else {
        return <Drawer open={isOpen} onClose={onClose}>
            <DrawerContent>
                <div className="pb-12">
                    <ReactionAnalyticsModal {...reactionProps} />
                </div>
            </DrawerContent>
        </Drawer>
    }
}