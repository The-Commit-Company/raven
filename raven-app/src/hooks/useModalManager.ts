import { useState } from "react"

/**
 * Hook to manage modals
 * @returns
 * modalType: The type of modal to open
 * modalContent: The content to pass to the modal
 * openModal: Function to open a modal
 * closeModal: Function to close a modal
 */
export enum ModalTypes {
    None,
    DeleteMessage,
    EditMessage,
    EmojiPicker,
    RenameChannel,
    EditChannelDescription,
    LeaveChannel,
    AddChannelMember,
    RemoveChannelMember,
    DeleteChannel,
    ArchiveChannel,
    ChangeChannelType,
    UserDetails,
    FilePreview,
    CommandPalette,
    GlobalSearch
}

interface ModalManager {
    modalType: ModalTypes,
    modalContent: any,
    openModal: (type: ModalTypes, content?: any) => void,
    closeModal: () => void,
    toggleModal: (type: ModalTypes, content?: any) => void
}

export const useModalManager = (): ModalManager => {

    const [modalType, setModalType] = useState(ModalTypes.None)
    const [modalContent, setModalContent] = useState(null)

    const openModal = (type: ModalTypes, content?: any) => {
        setModalType(type)
        setModalContent(content)
    }

    const closeModal = () => {
        setModalType(ModalTypes.None)
        setModalContent(null)
    }

    const toggleModal = (type: ModalTypes, content?: any) => {
        if (modalType === type) {
            closeModal()
        } else {
            openModal(type, content)
        }
    }

    return { modalType, modalContent, openModal, closeModal, toggleModal }
}
