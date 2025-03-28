import { FrappeError, useFrappeDocTypeEventListener, useFrappeGetCall, SWRConfiguration } from 'frappe-react-sdk'
import { createContext, useContext, useMemo } from 'react'
import { KeyedMutator } from 'swr'
import { useSWRConfig } from 'frappe-react-sdk'
import { ChannelList } from '@raven/types/common/ChannelListItem'


export interface ChannelListContextType extends ChannelList {
    mutate: KeyedMutator<{ message: ChannelList }>,
    error?: FrappeError,
    isLoading: boolean
}
export const ChannelListContext = createContext<ChannelListContextType | null>(null)


/** Use this hook to get the channel list */
export const useChannelList = (): ChannelListContextType => {
    const context = useContext(ChannelListContext)
    if (!context) {
        throw new Error('useChannelList must be used within a ChannelListProvider')
    }
    return context
}

/**
 * Hook to fetch the channel list - all channels + DM's + other users if any. The channel list is sorted by the last message timestamp.
 * Also listens to the channel_list_updated event to update the channel list
 * 
 * This is supposed to be used in the ChannelListContext and only once in the app since it has realtime event listeners
 */
export const useChannelListProvider = ({ swrConfig }: { swrConfig?: SWRConfiguration }): ChannelListContextType => {

    const { mutate: globalMutate } = useSWRConfig()
    const { data, mutate, ...rest } = useFrappeGetCall<{ message: ChannelList }>("raven.api.raven_channel.get_all_channels", {
        hide_archived: false
    }, `channel_list`, {
        revalidateOnFocus: false,
        ...swrConfig
    })

    useFrappeDocTypeEventListener('Raven Channel', () => {
        mutate()

        // Also update the unread channel count
        globalMutate('unread_channel_count')
    })

    const { sortedChannels, sortedDMChannels } = useMemo(() => {
        let sortedChannels = data?.message.channels ?? []
        let sortedDMChannels = data?.message.dm_channels ?? []

        sortedChannels = sortedChannels.sort((a, b) => {
            const bTimestamp = b.last_message_timestamp ? new Date(b.last_message_timestamp).getTime() : 0
            const aTimestamp = a.last_message_timestamp ? new Date(a.last_message_timestamp).getTime() : 0
            return new Date(bTimestamp).getTime() - new Date(aTimestamp).getTime()
        })

        sortedDMChannels = sortedDMChannels.sort((a, b) => {
            const bTimestamp = b.last_message_timestamp ? new Date(b.last_message_timestamp).getTime() : 0
            const aTimestamp = a.last_message_timestamp ? new Date(a.last_message_timestamp).getTime() : 0
            return new Date(bTimestamp).getTime() - new Date(aTimestamp).getTime()
        })

        return { sortedChannels, sortedDMChannels }
    }, [data])

    return {
        channels: sortedChannels,
        dm_channels: sortedDMChannels,
        mutate,
        ...rest
    }

}