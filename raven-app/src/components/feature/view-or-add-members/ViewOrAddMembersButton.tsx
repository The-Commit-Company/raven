import { ButtonGroup } from "@chakra-ui/react"
import { AddMembersButton } from "./AddMembersButton"
import { ViewChannelDetailsButton } from "./ViewChannelDetailsButton"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembers } from "@/pages/ChatSpace"

interface ViewOrAddMembersButtonProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    updateMembers: () => void
}

export const ViewOrAddMembersButton = ({ channelData, channelMembers, updateMembers }: ViewOrAddMembersButtonProps) => {
    return (
        <ButtonGroup isAttached size='sm' variant='outline'>
            <ViewChannelDetailsButton
                channelData={channelData}
                channelMembers={channelMembers}
                updateMembers={updateMembers} />
            {(channelData.type === 'Private' || channelData.type === 'Public') && <AddMembersButton
                type={channelData.type}
                channel_name={channelData.channel_name}
                updateMembers={updateMembers} />}
        </ButtonGroup>
    )
}