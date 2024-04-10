import { useMemo } from "react"
import { ChannelMembers } from "@/components/features/channels/channel-members/AddChannelMembers"
import { useFrappeGetCall } from "frappe-react-sdk"

export const useGetChannelMembers = (channelID: string) =>{

    const { data, error, mutate } = useFrappeGetCall<{ message: ChannelMembers }>('raven.api.chat.get_channel_members', {
        channel_id: channelID
    }, undefined, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
    })

    const channelMembers = useMemo(() => {
        if (data?.message) {
            return Object.values(data.message)
        } else {
            return []
        }
    }, [data])

    return{
        channelMembers,
        mutate,
        error
    }
}