import { useContext } from 'react'
import { ChannelListContext } from '../providers/ChannelListProvider'

/**
 * Hook to get the DM channels from the channel list provider. Also returns if the channel list is loading or not.
 * @param props 
 * @returns 
 */
const useGetDirectMessageChannels = () => {

    const channelListContextData = useContext(ChannelListContext)

    return {
        dmChannels: channelListContextData?.dm_channels ?? [],
        isLoading: channelListContextData?.isLoading ?? false
    }
}

export default useGetDirectMessageChannels