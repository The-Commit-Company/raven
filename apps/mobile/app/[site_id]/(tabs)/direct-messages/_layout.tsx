import { useColorScheme } from '@hooks/useColorScheme';
import { Stack } from 'expo-router';
import { __ } from '@lib/i18n';

const DirectMessagesLayout = () => {
const { colors } = useColorScheme()

    return (
        <Stack screenOptions={{ headerStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name='index'
                options={{
                    title: __("Direct Messages"),
                    headerLargeTitle: false
                }} />
        </Stack>
    )
}

export default DirectMessagesLayout