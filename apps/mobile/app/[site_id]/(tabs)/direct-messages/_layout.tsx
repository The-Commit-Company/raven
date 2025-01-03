import { useColorScheme } from '@hooks/useColorScheme';
import { Stack } from 'expo-router';

const DirectMessagesLayout = () => {

    const { colors } = useColorScheme()

    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background }
        }}>
            <Stack.Screen name='index'
                options={{
                    title: 'Direct Messages',
                    headerLargeTitle: false,
                }} />
        </Stack>
    )
}

export default DirectMessagesLayout