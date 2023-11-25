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

    return (
        <Flex>
            <ViewChannelDetailsButton
                channelData={channelData}
                channelMembers={channelMembers}
                updateMembers={updateMembers} />
            {/* members can be added to public and private channels only, as open channels are open to everyone */}
            {(channelData.type === 'Private' || channelData.type === 'Public') && channelMembers[currentUser] && channelData.is_archived === 0 && <AddMembersButton
                channelData={channelData}
                channelMembers={channelMembers}
                updateMembers={updateMembers}
                className="rounded-l-none border-l-0"
                isIconButton={true} />}
        </Flex>
    )
}