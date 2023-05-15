import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import { createContext, PropsWithChildren, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useFrappeEventListener } from '../../hooks/useFrappeEventListener'
import { ChannelData } from '../../types/Channel/Channel'
import { User } from '../../types/User/User'

type ChannelInfo = {
    channel_members: ChannelMembersDetails[],
    channel_data: ChannelData
}

export type ChannelMembersDetails = {
    name: string,
    first_name: string,
    full_name: string,
    user_image: string
}

export const ChannelContext = createContext<{ channelMembers: Record<string, ChannelMembersDetails>; channelData?: ChannelData, users: Record<string, User> }>({ channelMembers: {}, users: {} })

export const ChannelProvider = ({ children }: PropsWithChildren) => {

    const { channelID } = useParams()
    const { data, error, mutate } = useFrappeGetCall<{ message: ChannelInfo }>('raven.raven_channel_management.doctype.raven_channel_member.raven_channel_member.get_channel_members_and_data', {
        channel_id: channelID
    })
    const { data: users, error: usersError } = useFrappeGetDocList<User>("User", {
        fields: ["full_name", "user_image", "name"],
        filters: [["name", "!=", "Guest"]]
    })

    useFrappeEventListener('member_added', (data) => {
        if (data.channel_id === channelID) {
            mutate()
        }
    })

    useFrappeEventListener('member_removed', (data) => {
        if (data.channel_id === channelID) {
            mutate()
        }
    })

    useFrappeEventListener('channel_updated', (data) => {
        if (data.channel_id === channelID) {
            mutate()
        }
    })

    const channelInfo = useMemo(() => {
        const cm: Record<string, ChannelMembersDetails> = {}
        data?.message.channel_members.forEach((member: ChannelMembersDetails) => {
            cm[member.name] = member
        })
        const userData: Record<string, User> = {}
        users?.forEach((user: User) => {
            userData[user.name] = user
        })
        return {
            channelMembers: cm,
            users: userData,
            channelData: data?.message.channel_data
        }
    }, [data, users])

    return (
        <>
            {data?.message?.channel_members && data?.message?.channel_members?.length > 0 && <ChannelContext.Provider value={channelInfo}>
                {children}
            </ChannelContext.Provider>}
        </>
    )
}