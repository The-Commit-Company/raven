import FullPageLoader from '@components/layout/FullPageLoader'
import { Text } from '@components/nativewindui/Text'
import { ChannelListContext, useChannelListProvider } from '@raven/lib/providers/ChannelListProvider'
import { UserListContext, useUserListProvider } from '@raven/lib/providers/UserListProvider'
import React, { PropsWithChildren } from 'react'
import { View } from 'react-native'

const Providers = (props: PropsWithChildren) => {

    const { users, enabledUsers, isLoading, error } = useUserListProvider()

    if (isLoading) {
        return <FullPageLoader />
    }

    if (error) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Error loading users</Text>
        </View>
    }

    return <UserListContext.Provider value={{ users, enabledUsers }}>
        <ChannelListProvider>
            {props.children}
        </ChannelListProvider>
    </UserListContext.Provider>
}

const ChannelListProvider = ({ children }: PropsWithChildren) => {
    const channelListContextData = useChannelListProvider({})

    if (channelListContextData.isLoading) {
        return <FullPageLoader />
    }

    if (channelListContextData.error) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Error loading channels</Text>
        </View>
    }

    return <ChannelListContext.Provider value={channelListContextData}>
        {children}
    </ChannelListContext.Provider>
}

export default Providers