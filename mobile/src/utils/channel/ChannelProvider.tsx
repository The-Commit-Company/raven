import { useFrappeGetCall } from 'frappe-react-sdk'
import { createContext, PropsWithChildren, useMemo } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useFrappeEventListener } from '../../hooks/useFrappeEventListener'
import { RavenChannel } from '../../../../types/RavenChannelManagement/RavenChannel'
import { User } from '../../../../types/Core/User'
import { RavenChannelMember } from '../../../../types/RavenChannelManagement/RavenChannelMember'

type ChannelInfo = {
    channel_members: ChannelMembersDetails[],
    channel_data: RavenChannel
}

export interface ChannelMembersDetails extends RavenChannelMember, User {
    first_name: string,
    full_name: string,
    user_image: string,
}

export type IdentityParam = { channelID: string }

export const ChannelContext = createContext<{ channelMembers: Record<string, ChannelMembersDetails>; channelData?: RavenChannel, users: Record<string, User> }>({ channelMembers: {}, users: {} })

export const ChannelProvider = ({ children, ...props }: PropsWithChildren<RouteComponentProps<IdentityParam>>) => {

    const { channelID } = props.match.params
    const { data, error, mutate } = useFrappeGetCall<{ message: ChannelInfo }>('raven.raven_channel_management.doctype.raven_channel_member.raven_channel_member.get_channel_members_and_data', {
        channel_id: channelID
    }, undefined, {
        revalidateOnFocus: false
    })
    const { data: users, error: usersError } = useFrappeGetCall<{ message: User[] }>('raven.raven_channel_management.doctype.raven_channel.raven_channel.get_raven_users_list', undefined, undefined, {
        revalidateOnFocus: false
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
        users?.message.forEach((user: User) => {
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
            {data?.message?.channel_members && <ChannelContext.Provider value={channelInfo}>
                {children}
            </ChannelContext.Provider>}
        </>
    )
}