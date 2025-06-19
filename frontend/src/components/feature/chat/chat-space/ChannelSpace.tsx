import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Box } from '@radix-ui/themes'
import { ChannelHeader } from '../../chat-header/ChannelHeader'
import { ChatBoxBody } from '../ChatStream/ChatBoxBody'

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
