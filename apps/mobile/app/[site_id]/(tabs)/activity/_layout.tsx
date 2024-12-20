import ShareButton from '@components/common/ShareButton';
import { Button } from '@components/nativewindui/Button';
import { useColorScheme } from '@hooks/useColorScheme';
import { router, Stack } from 'expo-router';

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
                    headerRight: () => <Button onPress={() => router.push({
                        pathname: '/file-viewer',
                        params: { uri: 'https://raven-dev.frappe.cloud/private/files/2013_mustang.jpg' },
                    })} />
                }} />
        </Stack>
    )
}

export default ActivityLayout