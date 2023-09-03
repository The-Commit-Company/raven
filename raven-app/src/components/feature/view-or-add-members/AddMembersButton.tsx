import { IconButton, Tooltip } from "@chakra-ui/react"
import { RiUserAddLine } from "react-icons/ri"
import { AddChannelMemberModal } from "../channels/AddChannelMemberModal"
import { ModalTypes, useModalManager } from "@/hooks/useModalManager"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"

interface AddMembersButtonProps {
    type: ChannelListItem['type'],
    channel_name: string,
    updateMembers: () => void
}

export const AddMembersButton = ({ type, channel_name, updateMembers }: AddMembersButtonProps) => {

    const modalManager = useModalManager()

    const onAddMemberModalOpen = () => {
        modalManager.openModal(ModalTypes.AddChannelMember)
    }

    return (
        <>
            <Tooltip hasArrow label='add members' placement='bottom-start' rounded={'md'}>
                <IconButton
                    onClick={onAddMemberModalOpen}
                    aria-label={"add members to channel"}
                    icon={<RiUserAddLine />}
                />
            </Tooltip>
            <AddChannelMemberModal
                isOpen={modalManager.modalType === ModalTypes.AddChannelMember}
                onClose={modalManager.closeModal}
                type={type}
                channel_name={channel_name}
                updateMembers={updateMembers} />
        </>
    )
}