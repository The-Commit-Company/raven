import FullPageLoader from '@components/layout/FullPageLoader'
import { Text } from '@components/nativewindui/Text'
import { ChannelListContext, useChannelListProvider } from '@raven/lib/providers/ChannelListProvider'
import { UserListContext, useUserListProvider } from '@raven/lib/providers/UserListProvider'
import React, { PropsWithChildren } from 'react'

const Providers = (props: PropsWithChildren) => {

    const { users, enabledUsers, isLoading, error } = useUserListProvider()

    if (isLoading) {
        return <FullPageLoader />
    }

    if (error) {
        return <Text>Error loading users</Text>
    }

    return <UserListContext.Provider value={{ users, enabledUsers }}>
        <ChannelListProvider>
            {props.children}
        </ChannelListProvider>
    </UserListContext.Provider>
}

const ChannelListProvider = ({ children }: PropsWithChildren) => {
    const channelListContextData = useChannelListProvider({})
    return <ChannelListContext.Provider value={channelListContextData}>
        {children}
    </ChannelListContext.Provider>
}

export default Providers