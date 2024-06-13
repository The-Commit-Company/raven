import { DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { Box } from "@radix-ui/themes"
import { DMChannelHeader } from "../../chat-header/DMChannelHeader"
import { ChatBoxBody } from "../ChatStream/ChatBoxBody"

interface DirectMessageSpaceProps {
    channelData: DMChannelListItem
}

export const DirectMessageSpace = ({ channelData }: DirectMessageSpaceProps) => {

    return (
        <Box>
            <DMChannelHeader
                channelData={channelData}
            />
            <ChatBoxBody channelData={channelData} />
        </Box>
    )
}