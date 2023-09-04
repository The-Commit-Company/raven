import { ModalTypes, useModalManager } from '@/hooks/useModalManager'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Button } from '@chakra-ui/react'
import { DeleteChannelModal } from './DeleteChannelModal'
import { BsTrash } from 'react-icons/bs'

interface DeleteChannelButtonProps {
    styles: {
        variant: string,
        size: string,
        p: string,
        justifyContent: string,
        _hover: {
            bg: string
        },
        rounded: string
    },
    onClose: () => void,
    channelData: ChannelListItem
}

export const DeleteChannelButton = ({ styles, onClose, channelData }: DeleteChannelButtonProps) => {

    const modalManager = useModalManager()

    const onDeleteChannelModalOpen = () => {
        modalManager.openModal(ModalTypes.DeleteChannel)
    }

    return (
        <>
            <Button {...styles}
                leftIcon={<BsTrash fontSize={'1rem'} />}
                colorScheme="red"
                onClick={onDeleteChannelModalOpen}>
                Delete channel
            </Button>
            <DeleteChannelModal
                isOpen={modalManager.modalType === ModalTypes.DeleteChannel}
                onClose={modalManager.closeModal}
                onCloseParent={onClose}
                channelData={channelData} />
        </>
    )
}