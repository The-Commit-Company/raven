import { ChannelMembers } from "@/pages/ChatSpace"
import { DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { Box } from "@chakra-ui/react"
import { DMChannelHeader } from "../ChatHeader/DMChannelHeader"
import { ChatBoxBody } from "./ChatBoxBody"

interface DirectMessageSpaceProps {
    channelData: DMChannelListItem,
    channelMembers: ChannelMembers
}

export const DirectMessageSpace = ({ channelData, channelMembers }: DirectMessageSpaceProps) => (
    <Box>
        <DMChannelHeader
            channelData={channelData}
            channelMembers={channelMembers} />
        <ChatBoxBody
            channelData={channelData}
            channelMembers={channelMembers} />
    </Box>
)