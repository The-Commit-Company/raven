import { IconButton, Tooltip } from "@chakra-ui/react"
import { EditMessageModal } from "../message-details/EditMessageModal"
import { AiOutlineEdit } from "react-icons/ai"
import { ModalTypes, useModalManager } from "@/hooks/useModalManager"

export const EditMessageButton = ({ messageID, text }: { messageID: string, text: string }) => {

    const modalManager = useModalManager()

    const onEditMessageModalOpen = () => {
        text && modalManager.openModal(ModalTypes.EditMessage)
    }

    return (
        <>
            <Tooltip hasArrow label='edit' size='xs' placement='top' rounded='md'>
                <IconButton
                    onClick={onEditMessageModalOpen}
                    aria-label="edit message"
                    icon={<AiOutlineEdit fontSize={'0.82rem'} />}
                    size='xs' />
            </Tooltip>
            <EditMessageModal
                isOpen={modalManager.modalType === ModalTypes.EditMessage}
                onClose={modalManager.closeModal}
                channelMessageID={messageID}
                originalText={text}
            />
        </>
    )
}