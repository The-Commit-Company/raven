import { Text, HStack, IconButton, ListItem, Tooltip, Button } from "@chakra-ui/react"
import { AddChannelMemberModal } from "./AddChannelMemberModal"
import { RiUserAddLine } from "react-icons/ri"
import { ModalTypes, useModalManager } from "@/hooks/useModalManager"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { BiUserPlus } from "react-icons/bi"

interface AddMembersButtonProps {
    channelData: ChannelListItem,
    updateMembers: () => void,
    style?: {
        bg: string,
        cursor: string
    },
    is_in_list?: boolean,
    is_in_empty_state?: boolean
}

export const AddMembersButton = ({ channelData, updateMembers, style, is_in_list, is_in_empty_state }: AddMembersButtonProps) => {

    const modalManager = useModalManager()

    const onAddMembersModalOpen = () => {
        modalManager.openModal(ModalTypes.AddChannelMember)
    }

    return (
        <>
            {is_in_list && <ListItem _hover={{ ...style }} rounded='md' onClick={onAddMembersModalOpen}>
                <HStack p='2' spacing={3}>
                    <IconButton
                        size='sm'
                        aria-label='add members'
                        icon={<RiUserAddLine />}
                        colorScheme='blue'
                        variant='outline'
                    />
                    <Text>Add members</Text>
                </HStack>
            </ListItem>}

            {is_in_empty_state &&
                <Button leftIcon={<BiUserPlus fontSize={'1.1rem'} />} onClick={onAddMembersModalOpen}>Add people</Button>
            }

            {!is_in_empty_state && !is_in_list && <Tooltip hasArrow label='add members' placement='bottom-start' rounded={'md'}>
                <IconButton
                    onClick={onAddMembersModalOpen}
                    aria-label={"add members to channel"}
                    icon={<RiUserAddLine />}
                />
            </Tooltip>}

            <AddChannelMemberModal
                isOpen={modalManager.modalType === ModalTypes.AddChannelMember}
                onClose={modalManager.closeModal}
                channelID={channelData.name}
                type={channelData.type}
                channel_name={channelData.channel_name}
                updateMembers={updateMembers} />
        </>
    )
}