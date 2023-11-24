import { Box } from '@radix-ui/themes'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChatBoxBody } from '../chat-history/ChatBoxBody'
import { ChannelHeader } from '../../chat-header/ChannelHeader'

interface ChannelSpaceProps {
    channelData: ChannelListItem
}

export const ChannelSpace = ({ channelData }: ChannelSpaceProps) => {

    return (
        <Box>
            <ChannelHeader channelData={channelData} />
            <ChatBoxBody channelData={channelData} />
        </Box>
    )
}