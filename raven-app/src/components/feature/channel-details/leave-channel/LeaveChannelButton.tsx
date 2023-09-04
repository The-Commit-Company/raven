import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Button } from '@chakra-ui/react'
import { LeaveChannelModal } from './LeaveChannelModal'
import { ModalTypes, useModalManager } from '@/hooks/useModalManager'

interface LeaveChannelButtonProps {
    channelData: ChannelListItem,
    onClose: () => void
}

export const LeaveChannelButton = ({ channelData, onClose }: LeaveChannelButtonProps) => {

    const modalManager = useModalManager()

    const onLeaveChannelModalOpen = () => {
        modalManager.openModal(ModalTypes.LeaveChannel)
    }

    return (
        <>
            <Button colorScheme='red' variant='link' size='sm' w='fit-content' onClick={onLeaveChannelModalOpen}>
                Leave channel
            </Button>
            <LeaveChannelModal
                isOpen={modalManager.modalType === ModalTypes.LeaveChannel}
                onClose={modalManager.closeModal}
                closeDetailsModal={onClose}
                channelData={channelData} />
        </>
    )
}