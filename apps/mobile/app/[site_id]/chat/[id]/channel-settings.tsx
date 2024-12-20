import { View } from "react-native"
import { Text } from '@components/nativewindui/Text'
import { Stack } from "expo-router"

const ChannelSettings = () => {
    return (
        <View>
            <Stack.Screen options={{
                title: 'Channel Settings',
                headerLargeTitle: true
            }} />
            <Text>Channel Settings</Text>
        </View>
    )
}

export default ChannelSettings