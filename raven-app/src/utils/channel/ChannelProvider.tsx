import { useFrappeGetCall } from 'frappe-react-sdk'
import { createContext, PropsWithChildren, useMemo } from 'react'
import { useParams } from 'react-router-dom'


type ChannelMembersDetails = {
    name: string,
    first_name: string,
    full_name: string,
    user_image: string
}

export const ChannelContext = createContext<Record<string, ChannelMembersDetails>>({})

export const ChannelProvider = ({ children }: PropsWithChildren) => {

    const { channelID } = useParams()
    const { data, error } = useFrappeGetCall<{ message: ChannelMembersDetails[] }>('raven.raven_channel_management.doctype.raven_channel_member.raven_channel_member.get_all_channel_members', {
        channel_id: channelID
    })

    const channelMembers = useMemo(() => {
        const cm: Record<string, ChannelMembersDetails> = {}
        data?.message.forEach((member: ChannelMembersDetails) => {
            cm[member.name] = member
        }
        )
        return cm
    }, [data])
    return (
        <ChannelContext.Provider value={channelMembers}>
            {children}
        </ChannelContext.Provider>
    )
}