import { Box } from '@radix-ui/themes'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChatBoxBody } from '../ChatStream/ChatBoxBody'
import { ChannelHeader } from '../../chat-header/ChannelHeader'
import { useParams } from 'react-router-dom'

interface ChannelSpaceProps {
    channelData: ChannelListItem
    canShowOpsRail?: boolean
    showOpsRail?: boolean
    onToggleOpsRail?: () => void
}

export const ChannelSpace = ({
    channelData,
    canShowOpsRail = false,
    showOpsRail = false,
    onToggleOpsRail,
}: ChannelSpaceProps) => {

    // const { threadID } = useParams()

    return (
        <Box>
            <ChannelHeader
                channelData={channelData}
                canShowOpsRail={canShowOpsRail}
                showOpsRail={showOpsRail}
                onToggleOpsRail={onToggleOpsRail}
            />
            <ChatBoxBody channelData={channelData} />
        </Box>
    )
}
