import { ChannelList } from "@raven/types/common/ChannelListItem"
import { useFrappeGetCall } from "frappe-react-sdk"

export const useChannels = () => {
    const { data, error, isLoading, mutate } = useFrappeGetCall<{
        message: ChannelList
    }>(
        'raven.api.raven_channel.get_all_channels',
        undefined,
        'channels-list',
        {
            revalidateOnFocus: false,
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