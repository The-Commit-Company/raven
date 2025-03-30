import FullPageLoader from '@components/layout/FullPageLoader'
import { ChannelListContext, useChannelListProvider } from '@raven/lib/providers/ChannelListProvider'
import { UserListContext, useUserListProvider } from '@raven/lib/providers/UserListProvider'
import { PropsWithChildren, Suspense, useEffect } from 'react'
import { TouchableOpacity, View } from 'react-native'
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
import { useFetchActiveUsersRealtime } from '@hooks/useFetchActiveUsers'
import useFirebasePushTokenListener from '@hooks/useFirebasePushTokenListener'
import { Text } from '@components/nativewindui/Text'
import RefreshIcon from '@assets/icons/RefreshIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'

const Providers = (props: PropsWithChildren) => {

    return (
        <UserListProvider>
            {props.children}
        </UserListProvider>
    )
}

const UserListProvider = ({ children }: PropsWithChildren) => {
    const { users, enabledUsers, isLoading, error, hasData, mutate } = useUserListProvider()

    useActiveSocketConnection()

    const { colors } = useColorScheme()

    if (isLoading) {
        return <FullPageLoader />
    }

    if (!hasData && error) {
        return <View className='bg-card px-2 gap-2 h-screen' style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ErrorBanner error={error} heading='There was an error while loading the user list.' />
            <View className='flex w-full gap-2 pt-8'>
                <TouchableOpacity onPress={() => mutate()}
                    activeOpacity={0.8}
                    hitSlop={10}
                    className="flex flex-row items-center py-3 px-4 rounded-xl justify-between bg-background">
                    <Text className="font-medium text-foreground">Reload App</Text>
                    <RefreshIcon height={20} width={20} fill={colors.icon} />
                </TouchableOpacity>
                <LogOutButton />
            </View>
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

    const channelListContextData = useChannelListProvider()

    const { colors } = useColorScheme()

    if (channelListContextData.isLoading) {
        return <FullPageLoader />
    }

    if (!channelListContextData.hasData && channelListContextData.error) {
        return <View className='bg-card px-2 gap-2 h-screen' style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ErrorBanner error={channelListContextData.error} heading='There was an error while loading the channel list.' />
            <View className='flex w-full gap-2 pt-8'>
                <TouchableOpacity onPress={() => channelListContextData.mutate()}
                    activeOpacity={0.8}
                    hitSlop={10}
                    className="flex flex-row items-center py-3 px-4 rounded-xl justify-between bg-background">
                    <Text className="font-medium text-foreground">Reload App</Text>
                    <RefreshIcon height={20} width={20} fill={colors.icon} />
                </TouchableOpacity>
                <LogOutButton />
            </View>
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

    useFetchActiveUsersRealtime()

    useFirebasePushTokenListener()

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
        if (data && data.message.length > 0) {
            if (!selectedWorkspace || !data.message.find((w) => w.name === selectedWorkspace)) {
                // If there's no selected workspace, or if the selected workspace is not in the list of workspaces, set the first workspace as the selected workspace
                setSelectedWorkspace(data.message[0].name)
            }
        }
    }, [data])

    return children
}

export default Providers