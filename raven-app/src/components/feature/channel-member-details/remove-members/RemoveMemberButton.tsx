import { Button } from '@chakra-ui/react'
import { RemoveChannelMemberModal } from './RemoveChannelMemberModal'
import { ModalTypes, useModalManager } from '@/hooks/useModalManager'
import { ChannelMembers } from '@/utils/channel/ChannelMembersProvider'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'

interface RemoveMemberButtonProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    updateMembers: () => void,
    selectedMember: string
}

export const RemoveMemberButton = ({ channelData, channelMembers, updateMembers, selectedMember }: RemoveMemberButtonProps) => {

    const modalManager = useModalManager()

    const onRemoveMembersModalOpen = () => {
        modalManager.openModal(ModalTypes.RemoveChannelMember)
    }

    return (
        <>
            <Button
                colorScheme='blue'
                variant='link'
                size='xs'
                onClick={onRemoveMembersModalOpen}>
                Remove
            </Button>
            <RemoveChannelMemberModal
                isOpen={modalManager.modalType === ModalTypes.RemoveChannelMember}
                onClose={modalManager.closeModal}
                user_id={selectedMember}
                channelData={channelData}
                channelMembers={channelMembers}
                updateMembers={updateMembers} />
        </>
    )
}