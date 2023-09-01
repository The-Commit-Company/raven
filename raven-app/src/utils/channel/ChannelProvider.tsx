import { useFrappeGetCall, useFrappeDocumentEventListener, useFrappeDocTypeEventListener } from 'frappe-react-sdk'
import { createContext, PropsWithChildren, useContext, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { RavenChannelMember } from '../../../../types/RavenChannelManagement/RavenChannelMember'
import { RavenChannel } from '../../../../types/RavenChannelManagement/RavenChannel'
import { User } from '../../../../types/Core/User'
import { Box } from '@chakra-ui/react'
import { ErrorBanner } from '../../components/layout/AlertBanner'
import { UserFields, UserListContext } from '../users/UserListProvider'

type ChannelInfo = {
    channel_members: ChannelMembersDetails[],
    channel_data: RavenChannel
}

export interface ChannelMembersDetails extends RavenChannelMember, UserFields {
    first_name: string,
    full_name: string,
    user_image: string,
}

export const ChannelContext = createContext<{ channelMembers: Record<string, ChannelMembersDetails>; channelData?: RavenChannel, users: Record<string, User> }>({ channelMembers: {}, users: {} })

export const ChannelProvider = ({ children }: PropsWithChildren) => {

    const { channelID } = useParams<{ channelID: string }>()
    const { data, error, mutate } = useFrappeGetCall<{ message: ChannelInfo }>('raven.raven_channel_management.doctype.raven_channel_member.raven_channel_member.get_channel_members_and_data', {
        channel_id: channelID
    }, undefined, {
        revalidateOnFocus: false
    })

    const { users } = useContext(UserListContext)

    //TODO: This should be moved down to the interface after it's ascertained that the Channel ID does exist
    useFrappeDocumentEventListener('Raven Channel', channelID as string, () => {
        mutate()
    })

    useFrappeDocTypeEventListener('Raven Channel Member', () => {
        //TODO: Can be optimized to only fire an update when this channel has an updated member list
        mutate()
    })


    const channelInfo = useMemo(() => {
        const cm: Record<string, ChannelMembersDetails> = {}
        data?.message.channel_members.forEach((member: ChannelMembersDetails) => {
            cm[member.name] = member
        })
        const userData: Record<string, UserFields> = {}
        users.forEach((user) => {
            userData[user.name] = user
        })
        return {
            channelMembers: cm,
            users: userData,
            channelData: data?.message.channel_data
        }
    }, [data, users])

    /**
     * Set the last channel in local storage
     */
    useEffect(() => {
        if (channelID) {
            localStorage.setItem('ravenLastChannel', channelID)
        }
    }, [channelID])

    return (
        <Box>
            <ErrorBanner error={error} />
            {data?.message?.channel_members && <ChannelContext.Provider value={channelInfo}>
                {children}
            </ChannelContext.Provider>}
        </Box>
    )
}