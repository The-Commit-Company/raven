import ShareButton from '@components/common/ShareButton';
import { useColorScheme } from '@hooks/useColorScheme';
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
                    headerLargeTitle: true,
                    headerRight: () => <ShareButton source={{ uri: '' }} />
                }} />
        </Stack>
    )
}

export default ActivityLayout