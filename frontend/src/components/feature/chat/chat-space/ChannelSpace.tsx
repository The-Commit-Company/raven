import { Box } from '@radix-ui/themes'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChatBoxBody } from '../ChatStream/ChatBoxBody'
import { ChannelHeader } from '../../chat-header/ChannelHeader'
import { useParams } from 'react-router-dom'

interface ChannelSpaceProps {
    channelData: ChannelListItem
}

export const ChannelSpace = ({ channelData }: ChannelSpaceProps) => {

    // const { threadID } = useParams()

    return (
        <Box>
            <ChannelHeader channelData={channelData} />
            <ChatBoxBody channelData={channelData} />
        </Box>
    )
}