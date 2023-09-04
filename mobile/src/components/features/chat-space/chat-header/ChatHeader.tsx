import { DirectMessageHeader } from './DirectMessageHeader'
import { ChannelHeader } from './ChannelHeader'
import { ChannelListItem, DMChannelListItem } from '@/utils/channel/ChannelListProvider'

export const ChatHeader = ({ channel }: { channel: ChannelListItem | DMChannelListItem }) => {


    if (channel.is_direct_message === 1) {
        return (
            <DirectMessageHeader channel={channel as DMChannelListItem} />
        )
    }
    return (
        <ChannelHeader channel={channel} />
    )
}