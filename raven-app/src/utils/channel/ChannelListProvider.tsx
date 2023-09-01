import { FrappeError, useFrappeDocTypeEventListener, useFrappeGetCall } from 'frappe-react-sdk'
import { PropsWithChildren, createContext } from 'react'
import { KeyedMutator } from 'swr'
import { useToast } from '@chakra-ui/react'
import { RavenChannel } from '../../../../types/RavenChannelManagement/RavenChannel'

export type DMChannelData = {
    name: string,
    is_self_message: 1 | 0,
    full_name: string,
    user_image: string,
    user_id: string,
}

export type ExtraUsersData = {
    name: string,
    full_name: string,
    user_image: string,
}

export type UnreadCountData = {
    total_unread_count_in_channels: number,
    total_unread_count_in_dms: number,
    channels: { name: string, user_id?: string, unread_count: number }[]
}
interface ChannelList {
    channels: RavenChannel[],
    dm_channels: DMChannelData[],
    extra_users: ExtraUsersData[]
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

/**
 * Hook to fetch the channel list - all channels + DM's + other users if any
 * Also listens to the channel_list_updated event to update the channel list
 */
export const useFetchChannelList = (): ChannelListContextType => {

    const toast = useToast()
    const { data, mutate, ...rest } = useFrappeGetCall<{ message: ChannelList }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_all_channels", undefined, undefined, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        onError: (error) => {
            toast({
                title: error.message,
                status: 'error'
            })
        }
    })

    useFrappeDocTypeEventListener('Raven Channel', () => {
        mutate()
    })

    return {
        channels: data?.message.channels ?? [],
        dm_channels: data?.message.dm_channels ?? [],
        extra_users: data?.message.extra_users ?? [],
        mutate,
        ...rest
    }

}