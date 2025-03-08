import FullPageLoader from '@components/layout/FullPageLoader'
import { ChannelListContext, useChannelListProvider } from '@raven/lib/providers/ChannelListProvider'
import { UserListContext, useUserListProvider } from '@raven/lib/providers/UserListProvider'
import { PropsWithChildren, useContext, useEffect } from 'react'
import { View } from 'react-native'
import { ActiveUserProvider } from './UserInactivityProvider'
import ErrorBanner from '@components/common/ErrorBanner'
import useFetchWorkspaces from '@raven/lib/hooks/useFetchWorkspaces'
import { useAtom } from 'jotai'
import { selectedWorkspaceFamily } from '@hooks/useGetCurrentWorkspace'
import LogOutButton from '@components/features/profile/profile-settings/LogOutButton'
import useSiteContext from '@hooks/useSiteContext'

const Providers = (props: PropsWithChildren) => {

    const { users, enabledUsers, isLoading, error } = useUserListProvider()

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
                    {props.children}
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
        <WorkspaceProvider>
            {children}
        </WorkspaceProvider>
    </ChannelListContext.Provider>
}

const WorkspaceProvider = ({ children }: PropsWithChildren) => {

    const siteInfo = useSiteContext()

    const [selectedWorkspace, setSelectedWorkspace] = useAtom(selectedWorkspaceFamily(siteInfo?.sitename || ''))
    const { data } = useFetchWorkspaces()

    useEffect(() => {
        if (data && data.message.length > 0 && !selectedWorkspace) {
            setSelectedWorkspace(data.message[0].name)
        }
    }, [data])

    return children
}

export default Providers