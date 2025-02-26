import { FrappeError, useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk'
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { KeyedMutator } from 'swr'
import { useSWRConfig } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { RavenChannel } from '@/types/RavenChannelManagement/RavenChannel'
import { useIsMobile } from '@/hooks/useMediaQuery'

export type UnreadChannelCountItem = { name: string, user_id?: string, unread_count: number, is_direct_message: 0 | 1 }

export type UnreadCountData = UnreadChannelCountItem[]

export type ChannelListItem = Pick<RavenChannel, 'name' | 'channel_name' | 'type' |
    'channel_description' | 'is_direct_message' | 'is_self_message' |
    'is_archived' | 'creation' | 'owner' | 'last_message_details' | 'last_message_timestamp' | 'workspace' | 'pinned_messages_string'> & { member_id: string }

export interface DMChannelListItem extends ChannelListItem {
    peer_user_id: string,
    is_direct_message: 1,
}

export interface SidebarChannelListItem extends ChannelListItem {
    is_archived: 0,
}

interface ChannelList {
    channels: ChannelListItem[],
    dm_channels: DMChannelListItem[]
}

export interface ChannelListContextType extends ChannelList {
    mutate: KeyedMutator<{ message: ChannelList }>,
    error?: FrappeError,
    isLoading: boolean
}
export const ChannelListContext = createContext<ChannelListContextType | null>(null)


export const ChannelListProvider = ({ children }: PropsWithChildren) => {

    const channelListContextData = useFetchChannelList()
    return (
        <ChannelListContext.Provider value={channelListContextData}>
            {children}
        </ChannelListContext.Provider>
    )
}

/** Use this hook to get the channel list */
export const useChannelList = (): ChannelListContextType => {
    const context = useContext(ChannelListContext)
    if (!context) {
        throw new Error('useChannelList must be used within a ChannelListProvider')
    }
    return context
}

/**
 * Hook to fetch the channel list - all channels + DM's + other users if any
 * Also listens to the channel_list_updated event to update the channel list
 */
const useFetchChannelList = (): ChannelListContextType => {

    const isMobile = useIsMobile()

    const { mutate: globalMutate } = useSWRConfig()
    const { data, mutate, ...rest } = useFrappeGetCall<{ message: ChannelList }>("raven.api.raven_channel.get_all_channels", {
        hide_archived: false
    }, `channel_list`, {
        revalidateOnFocus: isMobile ? true : false,
        onError: (error) => {
            toast.error("There was an error while fetching the channel list.", {
                description: getErrorMessage(error)
            })
        }
    })

    const [newUpdatesAvailable, setNewUpdatesAvailable] = useState(0)

    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined
        if (newUpdatesAvailable) {
            timeout = setTimeout(() => {
                mutate()
                // Also update the unread channel count
                globalMutate('unread_channel_count')
                setNewUpdatesAvailable(0)
            }, 1000) // 1 second
        }
        return () => clearTimeout(timeout)
    }, [newUpdatesAvailable])

    /** 
     * If a bulk import happens, this gets called multiple times potentially causing the server to go down.
     * Instead, throttle this - wait for all events to subside
     */
    useFrappeEventListener('channel_list_updated', () => {
        if (!rest.isValidating) {
            setNewUpdatesAvailable((n) => n + 1)
        }
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


export const useUpdateLastMessageInChannelList = () => {

    const { mutate: globalMutate } = useSWRConfig()

    const updateLastMessageInChannelList = async (channelID: string, lastMessageTimestamp: string) => {

        globalMutate(`channel_list`, async (channelList?: { message: ChannelList }) => {
            if (channelList) {

                let isChannelPresent = channelList.message.channels.find((channel) => channel.name === channelID)
                let isMainChannel = isChannelPresent ? true : false
                let isDMChannel = false
                if (!isChannelPresent) {
                    isChannelPresent = channelList.message.dm_channels.find((channel) => channel.name === channelID)
                    isDMChannel = isChannelPresent ? true : false
                }

                if (isChannelPresent) {
                    // Update the last message details in the channel list
                    let newChannels = channelList.message.channels
                    let newDMChannels = channelList.message.dm_channels

                    if (isMainChannel) {
                        newChannels = newChannels.map((channel) => {
                            if (channel.name === channelID) {
                                return {
                                    ...channel,
                                    last_message_timestamp: lastMessageTimestamp
                                }
                            }
                            return channel
                        })
                    }

                    if (isDMChannel) {
                        newDMChannels = newDMChannels.map((channel) => {
                            if (channel.name === channelID) {
                                return {
                                    ...channel,
                                    last_message_timestamp: lastMessageTimestamp
                                }
                            }
                            return channel
                        })
                    }

                    return {
                        message: {
                            channels: newChannels,
                            dm_channels: newDMChannels,
                        }
                    }
                }
            }

            // If nothing changed, return the same channel list
            return channelList

        }, {
            revalidate: false
        })
    }

    return { updateLastMessageInChannelList }

}