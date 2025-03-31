import { useColorScheme } from '@hooks/useColorScheme';
import { Stack } from 'expo-router';

const ThreadsLayout = () => {

    const { colors } = useColorScheme()

    return (
        <Stack screenOptions={{ headerStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name='index'
                options={{
                    title: 'Threads',
                    headerLargeTitle: true
                }} />
        </Stack>
    )
}

export default ThreadsLayout