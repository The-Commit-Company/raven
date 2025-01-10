import React, { useContext, useMemo } from 'react'
import { ChannelListContext } from '../providers/ChannelListProvider'

type Props = {
    /** If set to true, will return all channels including archived ones. */
    showArchived?: boolean
}

/**
 * Hook to get the channels from the channel list provider. Also returns if the channel list is loading or not.
 * @param props 
 * @returns 
 */
const useGetChannels = ({ showArchived = false }: Props) => {

    const channelListContextData = useContext(ChannelListContext)

    const filteredChannels = useMemo(() => {
        if (showArchived) return channelListContextData?.channels ?? []
        return channelListContextData?.channels?.filter(channel => !channel.is_archived) ?? []
    }, [channelListContextData?.channels, showArchived])

    return {
        channels: filteredChannels,
        isLoading: channelListContextData?.isLoading ?? false
    }
}

export default useGetChannels