import { ViewChannelDetailsButton } from "./ViewChannelDetailsButton"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembersContext, ChannelMembersContextType } from "@/utils/channel/ChannelMembersProvider"
import { useContext } from "react"
import { AddMembersButton } from "../channel-member-details/add-members/AddMembersButton"
import { UserContext } from "@/utils/auth/UserProvider"
import { Flex } from "@radix-ui/themes"

interface ViewOrAddMembersButtonProps {
    channelData: ChannelListItem
}

export const ViewOrAddMembersButton = ({ channelData }: ViewOrAddMembersButtonProps) => {

    const { channelMembers, mutate: updateMembers } = useContext(ChannelMembersContext) as ChannelMembersContextType
    const { currentUser } = useContext(UserContext)

    const allowAddMembers = ['Public', 'Private'].includes(channelData.type) && channelData.is_archived === 0 && channelMembers[currentUser] !== undefined

    return (
        <Flex>
            <ViewChannelDetailsButton
                channelData={channelData}
                allowAddMembers={allowAddMembers}
                channelMembers={channelMembers}
                updateMembers={updateMembers} />
            {/* members can be added to public and private channels only, as open channels are open to everyone */}
            {allowAddMembers && <AddMembersButton
                channelData={channelData}
                channelMembers={channelMembers}
                updateMembers={updateMembers}
                className="rounded-l-none relative -left-0.5"
                isIconButton={true} />}
        </Flex>
    )
}