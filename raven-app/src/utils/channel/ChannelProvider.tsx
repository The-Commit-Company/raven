import { useFrappeGetCall } from 'frappe-react-sdk'
import { createContext, PropsWithChildren, useMemo } from 'react'
import { useParams } from 'react-router-dom'

type ChannelInfo = {
    channel_members: ChannelMembersDetails[],
    channel_data: ChannelData
}

type ChannelMembersDetails = {
    name: string,
    first_name: string,
    full_name: string,
    user_image: string
}

type ChannelData = {
    channel_name: string,
    type: string
}

export const ChannelContext = createContext<{ channelMembers: Record<string, ChannelMembersDetails>; channelData: Record<string, ChannelData> }>({ channelMembers: {}, channelData: {} })

export const ChannelProvider = ({ children }: PropsWithChildren) => {

    const { channelID } = useParams()
    const { data, error } = useFrappeGetCall<{ message: ChannelInfo }>('raven.raven_channel_management.doctype.raven_channel_member.raven_channel_member.get_channel_members_and_data', {
        channel_id: channelID
    })

    const channelMembers = useMemo(() => {
        const cm: Record<string, ChannelMembersDetails> = {}
        data?.message.channel_members.forEach((member: ChannelMembersDetails) => {
            cm[member.name] = member
        })
        return cm
    }, [data])

    const channelData = data?.message.channel_data ?? {}

    const channelInfo = useMemo(() => {
        return {
            channelMembers,
            channelData
        }
    }, [channelMembers, channelData])

    return (
        <ChannelContext.Provider value={channelInfo}>
            {children}
        </ChannelContext.Provider>
    )
}