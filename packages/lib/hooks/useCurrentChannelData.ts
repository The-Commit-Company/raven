import { ChannelListItem, DMChannelListItem } from "@raven/types/common/ChannelListItem"
import { useContext, useMemo } from "react"
import { ChannelListContext, ChannelListContextType } from "../providers/ChannelListProvider"

interface CurrentChannelDMData {
    channelData: DMChannelListItem,
    type: "dm",
}

interface CurrentChannelData {
    channelData: ChannelListItem,
    type: "channel",
}

export const useCurrentChannelData = (channelID: string) => {

    const { channels, dm_channels, error, isLoading } = useContext(ChannelListContext) as ChannelListContextType

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

    return { channel, error, isLoading }

}