import { FrappeError, useFrappeGetCall } from 'frappe-react-sdk'
import { PropsWithChildren, createContext } from 'react'
import { useParams } from 'react-router-dom'
import { KeyedMutator } from 'swr'

export type Member = {
    name: string
    full_name: string
    user_image: string | null
    first_name: string
    is_admin: 1 | 0
}

export type ChannelMembers = {
    [name: string]: Member
}

export interface ChannelMembersContextType {
    channelMembers: ChannelMembers,
    mutate: KeyedMutator<{ message: ChannelMembers }>,
    error?: FrappeError,
    isLoading: boolean
}

export const ChannelMembersContext = createContext<ChannelMembersContextType | null>(null)

export const ChannelMembersProvider = ({ children, channelID }: PropsWithChildren<{ channelID: string}>) => {


    const channelMembers = useFetchChannelMembers(channelID)

    if (channelID) {
        return (
            <ChannelMembersContext.Provider value={channelMembers}>
                {children}
            </ChannelMembersContext.Provider>
        )
    }

    return null
}

const useFetchChannelMembers = (channelID: string): ChannelMembersContextType | null => {

    const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: ChannelMembers }>('raven.api.chat.get_channel_members', {
        channel_id: channelID
    }, undefined, {
        revalidateOnFocus: false
    })

    return {
        channelMembers: data?.message ?? {},
        error,
        isLoading,
        mutate
    }
}
