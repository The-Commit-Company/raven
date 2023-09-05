import { ChannelListItem, DMChannelListItem, useChannelList } from "@/utils/channel/ChannelListProvider"
import { useMemo } from "react"


export const useGetChannelData = (channelID: string) => {

    const { channels, dm_channels, isLoading, error } = useChannelList()

    /**
     * Function to find the channel information from the channelID
     * The channel could be a DM or a regular channel
     */
    const channel: ChannelListItem | DMChannelListItem | undefined = useMemo(() => {
        if (channelID) {
            const channel = channels.find(channel => channel.name === channelID)
            if (channel) return channel
            const dm_channel = dm_channels.find(channel => channel.name === channelID)
            if (dm_channel) return dm_channel
        }

        return undefined
    }, [channels, dm_channels, channelID])

    return {
        channel,
        isLoading,
        error
    }
}