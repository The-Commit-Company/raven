import { useColorScheme } from '@lib/useColorScheme';
import { Stack } from 'expo-router';

const ActivityLayout = () => {

    const { colors } = useColorScheme()

    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background }
        }}>
            <Stack.Screen name='index'
                options={{
                    title: 'Activity',
                    headerLargeTitle: true
                }} />
        </Stack>
    )
}

export default ActivityLayout