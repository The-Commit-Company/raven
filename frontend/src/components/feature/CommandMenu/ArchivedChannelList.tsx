import { useChannelList } from '@/utils/channel/ChannelListProvider'
import { Command } from 'cmdk'
import ChannelItem from './ChannelItem'

type Props = {}

const ArchivedChannelList = (props: Props) => {

    const { channels } = useChannelList()

    const archivedChannels = channels.filter((channel) => channel.is_archived)
    return (
        <Command.Group heading="Older Channels">
            {archivedChannels.map((channel) => (
                <ChannelItem key={channel.channel_name} channel={channel} />
            ))}
        </Command.Group>
    )
}
export default ArchivedChannelList