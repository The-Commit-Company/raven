import { IconButton, Tooltip } from '@chakra-ui/react'
import { BiEditAlt } from 'react-icons/bi'
import { ModalTypes, useModalManager } from "@/hooks/useModalManager"
import { ChannelRenameModal } from '@/components/feature/channel-details/EditChannelDetails/ChannelRenameModal'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'

interface EditChannelNameButtonProps {
    channelID: string,
    channel_name: string,
    type: ChannelListItem['type']
}

export const EditChannelNameButton = ({ channelID, channel_name, type }: EditChannelNameButtonProps) => {

    const modalManager = useModalManager()
    const onRenameChannelModalOpen = () => {
        modalManager.openModal(ModalTypes.RenameChannel)
    }

    return (
        <>
            <Tooltip hasArrow label='edit channel name' placement="bottom" rounded='md'>
                <IconButton
                    aria-label="edit-channel-name"
                    icon={<BiEditAlt />}
                    onClick={onRenameChannelModalOpen}
                    size='sm'
                    variant='ghost'
                />
            </Tooltip>
            <ChannelRenameModal
                isOpen={modalManager.modalType === ModalTypes.RenameChannel}
                onClose={modalManager.closeModal}
                channelID={channelID}
                channel_name={channel_name}
                type={type} />
        </>
    )
}