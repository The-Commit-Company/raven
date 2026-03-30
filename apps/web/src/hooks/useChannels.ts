import { ChannelList } from "@raven/types/common/ChannelListItem"
import { useFrappeGetCall } from "frappe-react-sdk"
import { useIsMobile } from "./use-mobile"

export const useChannels = () => {
    const isMobile = useIsMobile()
    const { data, error, isLoading, mutate } = useFrappeGetCall<{
        message: ChannelList
    }>(
        'raven.api.raven_channel.get_all_channels',
        { hide_archived: false },
        'channel_list',
        {
            revalidateOnFocus: isMobile,
            // revalidateOnMount: false,
            revalidateIfStale: false,
            revalidateOnReconnect: true
        }
    )

    return {
        channels: data?.message?.channels ?? [],
        dm_channels: data?.message?.dm_channels ?? [],
        error,
        isLoading,
        mutate
    }
}