import FullPageLoader from '@components/layout/FullPageLoader'
import { ChannelListContext, useChannelListProvider } from '@raven/lib/providers/ChannelListProvider'
import { UserListContext, useUserListProvider } from '@raven/lib/providers/UserListProvider'
import { PropsWithChildren } from 'react'
import { View } from 'react-native'
import { ActiveUserProvider } from './UserInactivityProvider'
import ErrorBanner from '@components/common/ErrorBanner'
import LogOutButton from '@components/features/profile/profile-settings/LogOutButton'

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
        {children}
    </ChannelListContext.Provider>
}

export default Providers