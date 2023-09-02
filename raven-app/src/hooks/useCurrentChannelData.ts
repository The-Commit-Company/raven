import { ChannelListContext, ChannelListContextType, ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { useContext, useMemo } from "react"

export const useCurrentChannelData = (channelID: string) => {

    const { channels, error, isLoading } = useContext(ChannelListContext) as ChannelListContextType

    const channelData = useMemo(() => {
        if (channelID) {
            return channels.find(channel => channel.name === channelID) as ChannelListItem
        } else {
            return undefined
        }
    }, [channelID, channels])

    return { channelData, error, isLoading }

}