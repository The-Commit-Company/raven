import FullPageLoader from '@components/layout/FullPageLoader'
import { Text } from '@components/nativewindui/Text'
import { ChannelListContext, useChannelListProvider } from '@raven/lib/providers/ChannelListProvider'
import { UserListContext, useUserListProvider } from '@raven/lib/providers/UserListProvider'
import React, { PropsWithChildren } from 'react'
import { ActiveUserProvider } from './UserInactivityProvider'

const Providers = (props: PropsWithChildren) => {

    const { users, enabledUsers, isLoading, error } = useUserListProvider()

    if (isLoading) {
        return <FullPageLoader />
    }

    if (error) {
        return <Text>Error loading users</Text>
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
        return <Text>Error loading channels</Text>
    }

    return <ChannelListContext.Provider value={channelListContextData}>
        {children}
    </ChannelListContext.Provider>
}

export default Providers