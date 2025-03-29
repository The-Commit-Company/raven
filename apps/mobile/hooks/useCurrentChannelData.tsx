import { useChannelList } from "@raven/lib/providers/ChannelListProvider"
import { ChannelListItem, DMChannelListItem } from "@raven/types/common/ChannelListItem"
import { useMemo } from "react"

export interface CurrentChannelDMData {
    channelData: DMChannelListItem,
    type: "dm",
}

export interface CurrentChannelData {
    channelData: ChannelListItem,
    type: "channel",
}

export const useCurrentChannelData = (channelID: string) => {

    const { channels, dm_channels, error, isLoading } = useChannelList()

    const channel: CurrentChannelData | CurrentChannelDMData | undefined = useMemo(() => {
        if (channelID) {
            const channel = channels?.find(channel => channel.name === channelID) as ChannelListItem
            if (channel) {
                return {
                    channelData: channel,
                    type: "channel"
                }
            }
            const dm_channel = dm_channels?.find(channel => channel.name === channelID) as DMChannelListItem
            if (dm_channel) {
                return {
                    channelData: dm_channel as DMChannelListItem,
                    type: "dm"
                }
            }
            return undefined
        } else {
            return undefined
        }
    }, [channelID, channels])

    return { channel, error, isLoading, workplaceID: channel?.channelData.workspace as string }

}