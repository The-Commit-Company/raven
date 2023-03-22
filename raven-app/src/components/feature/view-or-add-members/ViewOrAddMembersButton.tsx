import { Avatar, AvatarBadge, AvatarGroup, Button, ButtonGroup, IconButton } from "@chakra-ui/react"
import { useContext } from "react"
import { RiUserAddLine } from "react-icons/ri"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"

interface ViewOrAddMembersButtonProps {
    onClickViewMembers: () => void,
    onClickAddMembers: () => void,
    activeUsers: string[]
}

export const ViewOrAddMembersButton = ({ onClickViewMembers, onClickAddMembers, activeUsers }: ViewOrAddMembersButtonProps) => {

    const { channelData, channelMembers } = useContext(ChannelContext)
    const members = Object.values(channelMembers)

    return (
        <ButtonGroup isAttached size='sm' variant='outline'>
            <Button onClick={onClickViewMembers} w='fit-content' pr='2' pl='1'>
                <AvatarGroup size='xs' max={2} borderRadius='md' spacing={-1} fontSize='2xs'>
                    {members.map((member) => (
                        <Avatar key={member.name} name={member.full_name} src={member.user_image} borderRadius='md'>
                            {activeUsers.includes(member.name) && <AvatarBadge boxSize='0.88em' bg='green.500' />}
                        </Avatar>
                    ))}
                </AvatarGroup>
            </Button>
            {(channelData?.type === 'Private' || channelData?.type === 'Public') &&
                <IconButton
                    onClick={onClickAddMembers}
                    aria-label={"add members to channel"}
                    icon={<RiUserAddLine />}
                />
            }
        </ButtonGroup>
    )
}