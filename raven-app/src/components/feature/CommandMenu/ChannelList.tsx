import { useFetchChannelList } from '@/utils/channel/ChannelListProvider'
import { Command } from 'cmdk'
import ChannelItem from './ChannelItem'

const ChannelList = () => {

    const { channels } = useFetchChannelList()

    const nonArchivedChannels = channels.filter((channel) => !channel.is_archived)
    return (
        <Command.Group heading="Channels">
            {nonArchivedChannels.map((channel) => (
                <ChannelItem key={channel.channel_name} channel={channel} />
            ))}
        </Command.Group>
    )
}
export default ChannelList