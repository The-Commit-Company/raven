import { DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { Box } from "@radix-ui/themes"
import { DMChannelHeader } from "../../chat-header/DMChannelHeader"
import { ChatBoxBody } from "../ChatStream/ChatBoxBody"
import { useContext } from "react"
import { ChannelMembersContext, ChannelMembersContextType } from "@/utils/channel/ChannelMembersProvider"

interface DirectMessageSpaceProps {
    channelData: DMChannelListItem
}

export const DirectMessageSpace = ({ channelData }: DirectMessageSpaceProps) => {

    const { channelMembers } = useContext(ChannelMembersContext) as ChannelMembersContextType

    return (
        <Box>
            <DMChannelHeader
                channelData={channelData}
                channelMembers={channelMembers} />
            <ChatBoxBody channelData={channelData} />
        </Box>
    )
}