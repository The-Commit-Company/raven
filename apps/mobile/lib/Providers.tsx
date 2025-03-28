import FullPageLoader from '@components/layout/FullPageLoader'
import { ChannelListContext, useChannelListProvider } from '@raven/lib/providers/ChannelListProvider'
import { UserListContext, useUserListProvider } from '@raven/lib/providers/UserListProvider'
import { PropsWithChildren, Suspense, useEffect } from 'react'
import { View } from 'react-native'
import { ActiveUserProvider } from './UserInactivityProvider'
import ErrorBanner from '@components/common/ErrorBanner'
import useFetchWorkspaces from '@raven/lib/hooks/useFetchWorkspaces'
import { useAtom } from 'jotai'
import { selectedWorkspaceFamily } from '@hooks/useGetCurrentWorkspace'
import LogOutButton from '@components/features/profile/profile-settings/LogOutButton'
import useSiteContext from '@hooks/useSiteContext'
import { useFetchUnreadMessageCount } from '@hooks/useUnreadMessageCount'
import { useFrappeEventListener, useSWRConfig } from 'frappe-react-sdk'
import { useUnreadThreadsCountEventListener } from '@hooks/useUnreadThreadsCount'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { useActiveSocketConnection } from '@hooks/useActiveSocketConnection'

const Providers = (props: PropsWithChildren) => {

    return (
        <UserListProvider>
            {props.children}
        </UserListProvider>
    )
}

const UserListProvider = ({ children }: PropsWithChildren) => {
    const { users, enabledUsers, isLoading, error } = useUserListProvider()

    useActiveSocketConnection()

    if (isLoading) {
        return <FullPageLoader />
    }

    if (error) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ErrorBanner error={error} />
            <LogOutButton />
        </View>
    }

    return (
        <ActiveUserProvider>
            <UserListContext.Provider value={{ users, enabledUsers }}>
                <ChannelListProvider>
                    {children}
                </ChannelListProvider>
            </UserListContext.Provider>
        </ActiveUserProvider>
    )
}

const ChannelListProvider = ({ children }: PropsWithChildren) => {

    const channelListContextData = useChannelListProvider({})

    if (channelListContextData.isLoading) {
        return <FullPageLoader />
    }

    if (channelListContextData.error) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ErrorBanner error={channelListContextData.error} />
        </View>
    }

    return <ChannelListContext.Provider value={channelListContextData}>
        <Suspense>
            <WorkspaceProvider>
                {children}
            </WorkspaceProvider>
        </Suspense>
    </ChannelListContext.Provider>
}

const WorkspaceProvider = ({ children }: PropsWithChildren) => {

    const siteInfo = useSiteContext()

    const [selectedWorkspace, setSelectedWorkspace] = useAtom(selectedWorkspaceFamily(siteInfo?.sitename || ''))
    const { data } = useFetchWorkspaces()

    useFetchUnreadMessageCount()

    // Listen to channel members updated events and invalidate the channel members cache
    const { mutate } = useSWRConfig()

    useFrappeEventListener('channel_members_updated', (payload) => {
        mutate(["channel_members", payload.channel_id])
    })

    const onThreadReplyEvent = useUnreadThreadsCountEventListener()

    const { myProfile } = useCurrentRavenUser()

    // Listen to realtime event for new message count
    useFrappeEventListener('thread_reply', (event) => {

        if (event.channel_id) {
            mutate(["thread_reply_count", event.channel_id], {
                message: event.number_of_replies
            }, {
                revalidate: false
            })
        }

        // Unread count only needs to be fetched for certain conditions

        // Ignore the event if the message is sent by the current user
        if (event.sent_by === myProfile?.name) return

        // Ignore the event if the message is in the current open thread
        // if (threadID === event.channel_id) return

        onThreadReplyEvent(event.channel_id)
    })

    useEffect(() => {
        if (data && data.message.length > 0 && !selectedWorkspace) {
            setSelectedWorkspace(data.message[0].name)
        }
    }, [data])

    return children
}

export default Providers