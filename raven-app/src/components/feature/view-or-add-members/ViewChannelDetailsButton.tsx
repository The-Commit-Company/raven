import { Avatar, AvatarBadge, AvatarGroup, Button, Icon, Tooltip, useDisclosure } from "@chakra-ui/react"
import { RiUserLine } from "react-icons/ri"
import { ViewChannelDetailsModal } from "../channels/ViewChannelDetailsModal"
import { ChannelMembers } from "@/pages/ChatSpace"
import { useContext } from "react"
import { ActiveUsersContext } from "@/utils/users/ActiveUsersProvider"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"

interface ViewChannelDetailsButtonProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    updateMembers: () => void
}

export const ViewChannelDetailsButton = ({ channelData, channelMembers, updateMembers }: ViewChannelDetailsButtonProps) => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const activeUsers = useContext(ActiveUsersContext)

    return (
        <>
            <Tooltip hasArrow label='view members/ channel details' placement='bottom-start' rounded={'md'}>
                <Button onClick={onOpen} w='fit-content' pr='2' pl='1'>
                    {Object.keys(channelMembers).length > 0 ? <AvatarGroup size='xs' max={2} borderRadius='md' spacing={-1} fontSize='2xs'>
                        {Object.entries(channelMembers).map(([name, member]) => (
                            <Avatar key={name} name={member.full_name} src={member.user_image ?? ''} borderRadius='md'>
                                {activeUsers.includes(name) && <AvatarBadge boxSize='0.88em' bg='green.500' />}
                            </Avatar>
                        ))}
                    </AvatarGroup> : <Icon as={RiUserLine} ml='1' />}
                </Button>
            </Tooltip>
            <ViewChannelDetailsModal
                isOpen={isOpen}
                onClose={onClose}
                channelData={channelData}
                channelMembers={channelMembers}
                activeUsers={activeUsers}
                updateMembers={updateMembers} />
        </>
    )
}