import { ButtonGroup } from "@chakra-ui/react"
import { ViewChannelDetailsButton } from "./ViewChannelDetailsButton"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembersContext, ChannelMembersContextType } from "@/utils/channel/ChannelMembersProvider"
import { useContext } from "react"
import { AddMembersButton } from "../channel-member-details/add-members/AddMembersButton"

interface ViewOrAddMembersButtonProps {
    channelData: ChannelListItem
}

export const ViewOrAddMembersButton = ({ channelData }: ViewOrAddMembersButtonProps) => {

    const { channelMembers, mutate: updateMembers } = useContext(ChannelMembersContext) as ChannelMembersContextType

    return (
        <ButtonGroup isAttached size='sm' variant='outline'>
            <ViewChannelDetailsButton
                channelData={channelData}
                channelMembers={channelMembers}
                updateMembers={updateMembers} />
            {/* members can be added to public and private channels only, as open channels are open to everyone */}
            {(channelData.type === 'Private' || channelData.type === 'Public') && <AddMembersButton
                channelData={channelData}
                updateMembers={updateMembers} />}
        </ButtonGroup>
    )
}