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
    EmojiPicker
}

interface ModalManager {
    modalType: ModalTypes
    openModal: (type: ModalTypes) => void
    closeModal: () => void
}

export const useModalManager = (): ModalManager => {
    const [modalType, setModalType] = useState(ModalTypes.None)

    const openModal = (type: ModalTypes) => {
        setModalType(type)
    }

    const closeModal = () => {
        setModalType(ModalTypes.None)
    }

    return { modalType, openModal, closeModal }
}
