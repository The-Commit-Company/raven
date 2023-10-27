import { createOutline } from "ionicons/icons"
import { ActionIcon, ActionItem, ActionLabel } from "./common"
import { useRef, useState } from "react"
import { EditMessageModal } from "./EditMessageModal"
import { TextMessage } from "../../../../../../types/Messaging/Message"

export interface EditActionProps {
    message: TextMessage,
    onSuccess: () => void,
}

export const EditMessageAction = ({ message, onSuccess }: EditActionProps) => {
    return <EditMessageActionItem message={message} onSuccess={onSuccess} />
}

export const EditMessageActionItem = ({ message, onSuccess }: EditActionProps) => {

    const [isOpen, setIsOpen] = useState(false)
    const pageRef = useRef()

    return (
        <>
            <ActionItem onClick={() => setIsOpen(true)}>
                <ActionIcon icon={createOutline} />
                <ActionLabel label='Edit' />
            </ActionItem>
            <EditMessageModal
                presentingElement={pageRef.current}
                isOpen={isOpen}
                onDismiss={onSuccess}
                originalText={message.text}
                messageID={message.name}
                channelID={message.channel_id} />
        </>
    )
}