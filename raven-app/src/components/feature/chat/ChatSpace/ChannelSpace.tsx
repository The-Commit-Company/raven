import { Box } from '@chakra-ui/react'
import { ChannelHeader } from '../ChatHeader/ChannelHeader/ChannelHeader'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { ChannelMembers } from '@/pages/ChatSpace'
import { ChatBoxBody } from './ChatBoxBody'

interface ChannelSpaceProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    updateMembers: () => void
}

export const ChannelSpace = ({ channelData, channelMembers, updateMembers }: ChannelSpaceProps) => {
    return (
        <Box>
            <ChannelHeader
                channelData={channelData}
                channelMembers={channelMembers}
                updateMembers={updateMembers} />
            <ChatBoxBody
                channelData={channelData}
                channelMembers={channelMembers}
                updateMembers={updateMembers} />
        </Box>
    )
}