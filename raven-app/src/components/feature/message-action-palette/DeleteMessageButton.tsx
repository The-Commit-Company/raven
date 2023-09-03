import { ModalTypes, useModalManager } from '@/hooks/useModalManager'
import { IconButton, Tooltip } from '@chakra-ui/react'
import { VscTrash } from 'react-icons/vsc'
import { DeleteMessageModal } from '../message-details/DeleteMessageModal'

export const DeleteMessageButton = ({ messageID }: { messageID: string }) => {

    const modalManager = useModalManager()

    const onDeleteMessageModalOpen = () => {
        modalManager.openModal(ModalTypes.DeleteMessage)
    }

    return (
        <>
            <Tooltip hasArrow label='delete' size='xs' placement='top' rounded='md'>
                <IconButton
                    onClick={onDeleteMessageModalOpen}
                    aria-label="delete message"
                    icon={<VscTrash fontSize={'0.9rem'} />}
                    size='xs' />
            </Tooltip>
            <DeleteMessageModal
                isOpen={modalManager.modalType === ModalTypes.DeleteMessage}
                onClose={modalManager.closeModal}
                channelMessageID={messageID}
            />
        </>
    )
}