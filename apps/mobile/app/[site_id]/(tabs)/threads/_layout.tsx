import { useColorScheme } from '@hooks/useColorScheme';
import { Stack } from 'expo-router';
import { __ } from '@lib/i18n';

const ThreadsLayout = () => {
const { colors } = useColorScheme()

    return (
        <Stack screenOptions={{ headerStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name='index'
                options={{
                    title: __("Threads"),
                    headerLargeTitle: true
                }} />
        </Stack>
    )
}

export default ThreadsLayout