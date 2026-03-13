import { useChannelList } from '@/utils/channel/ChannelListProvider'
import { Command } from 'cmdk'
import ChannelItem from './ChannelItem'
import { useMemo } from 'react'

const ChannelList = ({ text }: { text: string }) => {

    const { channels } = useChannelList()

    // The channels are already sorted by last_message_timestamp, so we just need to sort the archived channels to the bottom
    const sortedChannels = useMemo(() => {
        const sortedChannels = [...channels]
        sortedChannels.sort((a, b) => {
            if (a.is_archived && !b.is_archived) return 1
            if (!a.is_archived && b.is_archived) return -1
            return 0
        })
        return sortedChannels
    }, [channels])

    const { filteredChannels } = useMemo(() => {
        return {
            filteredChannels: sortedChannels.filter((channel) => channel.channel_name.toLowerCase().includes(text.toLowerCase()))
        }
    }, [sortedChannels, text])

    if (filteredChannels.length === 0) {
        return null
    }

    return (
        <Command.Group heading="Channels">
            {filteredChannels.map((channel) => (
                <ChannelItem key={channel.name} channel={channel} />
            ))}
        </Command.Group>
    )
}
export default ChannelList