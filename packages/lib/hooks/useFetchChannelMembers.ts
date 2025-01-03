import { useFrappeGetCall } from "frappe-react-sdk"

export type Member = {
    name: string
    full_name: string
    user_image: string | null
    first_name: string
    is_admin: 1 | 0,
    type?: 'User' | 'Bot',
    availability_status?: 'Available' | 'Away' | 'Do not disturb' | 'Invisible' | '',
    allow_notifications?: 1 | 0,
    channel_member_name?: string
}

export type ChannelMembers = {
    [name: string]: Member
}

export const useFetchChannelMembers = (channelID: string) => {

    const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: ChannelMembers }>('raven.api.chat.get_channel_members', {
        channel_id: channelID
    }, ["channel_members", channelID], {
        dedupingInterval: 1000 * 60 * 5, // Set to 5 minutes,
        revalidateOnMount: true
    })

    return {
        channelMembers: data?.message ?? {},
        error,
        isLoading,
        mutate
    }
}


// TODO: Add a hook for realtime updates of channel members