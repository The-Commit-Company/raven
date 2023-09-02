import { Box } from '@chakra-ui/react'
import { ChannelHeader } from '../ChatHeader/ChannelHeader/ChannelHeader'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'

interface ChannelSpaceProps {
    channelData: ChannelListItem
}

export const ChannelSpace = ({ channelData }: ChannelSpaceProps) => {
    return (
        <Box>
            <ChannelHeader
                channelID={channelData.name}
                channel_name={channelData.channel_name}
                type={channelData.type} />
        </Box>
    )
}