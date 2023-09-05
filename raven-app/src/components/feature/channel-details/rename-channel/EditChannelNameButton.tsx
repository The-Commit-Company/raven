import { ButtonProps, IconButton, Tooltip } from '@chakra-ui/react'
import { BiEditAlt } from 'react-icons/bi'
import { ModalTypes, useModalManager } from "@/hooks/useModalManager"
import { ChannelRenameModal } from '@/components/feature/channel-details/rename-channel/ChannelRenameModal'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'

interface EditChannelNameButtonProps extends ButtonProps {
    channelID: string,
    channel_name: string,
    channelType: ChannelListItem['type']
}

export const EditChannelNameButton = ({ channelID, channel_name, channelType, ...props }: EditChannelNameButtonProps) => {

    const modalManager = useModalManager()
    const onRenameChannelModalOpen = () => {
        modalManager.openModal(ModalTypes.RenameChannel)
    }

    return (
        <>
            <Tooltip hasArrow label='Edit channel name' placement="bottom" rounded='md'>
                <IconButton
                    aria-label="edit-channel-name"
                    icon={<BiEditAlt />}
                    onClick={onRenameChannelModalOpen}
                    size='sm'
                    variant='ghost'
                    {...props}
                />
            </Tooltip>
            <ChannelRenameModal
                isOpen={modalManager.modalType === ModalTypes.RenameChannel}
                onClose={modalManager.closeModal}
                channelID={channelID}
                channel_name={channel_name}
                type={channelType} />
        </>
    )
}