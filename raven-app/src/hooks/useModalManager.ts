import { useState } from "react"

/**
 * Hook to manage modals
 * @returns
 * modalType: The type of modal to open
 * modalContext: The context to pass to the modal
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
    FilePreview
}

interface ModalManager {
    modalType: ModalTypes,
    modalContext: any,
    openModal: (type: ModalTypes, context?: any) => void,
    closeModal: () => void
}

export const useModalManager = (): ModalManager => {

    const [modalType, setModalType] = useState(ModalTypes.None)
    const [modalContext, setModalContext] = useState(null)

    const openModal = (type: ModalTypes, context?: any) => {
        setModalType(type)
        setModalContext(context)
    }

    const closeModal = () => {
        setModalType(ModalTypes.None)
        setModalContext(null)
    }

    return { modalType, modalContext, openModal, closeModal }
}
