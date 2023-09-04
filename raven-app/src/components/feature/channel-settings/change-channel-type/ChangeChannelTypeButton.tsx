import { ModalTypes, useModalManager } from '@/hooks/useModalManager'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Button, Icon } from '@chakra-ui/react'
import { BiHash, BiLockAlt } from 'react-icons/bi'
import { ChangeChannelTypeModal } from './ChangeChannelTypeModal'

interface ChangeChannelTypeButtonProps {
    channelData: ChannelListItem,
    styles: {
        variant: string,
        size: string,
        p: string,
        justifyContent: string,
        _hover: {
            bg: string
        },
        rounded: string
    }
}

export const ChangeChannelTypeButton = ({ channelData, styles }: ChangeChannelTypeButtonProps) => {

    const modalManager = useModalManager()

    const onChannelTypeChangeModalOpen = () => {
        modalManager.openModal(ModalTypes.ChangeChannelType)
    }

    return (
        <>
            <Button {...styles}
                leftIcon={channelData.type === 'Public' ? <Icon as={BiLockAlt} /> : <Icon as={BiHash} />}
                colorScheme="black"
                onClick={onChannelTypeChangeModalOpen}>
                Change to a {channelData.type === 'Public' ? 'private' : 'public'} channel
            </Button>
            <ChangeChannelTypeModal
                isOpen={modalManager.modalType === ModalTypes.ChangeChannelType}
                onClose={modalManager.closeModal}
                channelData={channelData} />
        </>
    )
}