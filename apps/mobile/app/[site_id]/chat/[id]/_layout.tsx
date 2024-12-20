import { useColorScheme } from "@hooks/useColorScheme"
import { Stack } from "expo-router"


const ChatLayout = () => {
    const { colors } = useColorScheme()

    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background }
        }}>
            <Stack.Screen name='index'
                options={{
                    title: 'Chat',
                    headerLargeTitle: false
                }}
            />
            <Stack.Screen name='channel-settings'
                options={{
                    title: 'Channel Settings',
                    headerLargeTitle: false
                }}
            />
        </Stack>
    )
}

export default ChatLayout