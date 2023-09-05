import { ModalTypes, useModalManager } from "@/hooks/useModalManager";
import { Button } from "@chakra-ui/react";
import { BsArchive } from "react-icons/bs";
import { ArchiveChannelModal } from "./ArchiveChannelModal";
import { ChannelListItem } from "@/utils/channel/ChannelListProvider";

interface ArchiveChannelButtonProps {
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

export const ArchiveChannelButton = ({ styles, onClose, channelData }: ArchiveChannelButtonProps) => {

    const modalManager = useModalManager()

    const onArchiveChannelModalOpen = () => {
        modalManager.openModal(ModalTypes.ArchiveChannel)
    }

    return (
        <>
            <Button {...styles}
                leftIcon={<BsArchive />}
                colorScheme="red"
                onClick={onArchiveChannelModalOpen}>
                Archive channel
            </Button>
            <ArchiveChannelModal
                isOpen={modalManager.modalType === ModalTypes.ArchiveChannel}
                onClose={modalManager.closeModal}
                onCloseViewDetails={onClose}
                channelData={channelData} />
        </>
    )
}