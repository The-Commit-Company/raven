import { useColorScheme } from '@lib/useColorScheme';
import { Stack } from 'expo-router';

const ProfileLayout = () => {

    const { colors } = useColorScheme()

    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background }
        }}>
            <Stack.Screen name='index'
                options={{
                    title: 'Profile',
                    headerLargeTitle: false
                }} />
        </Stack>
    )
}

export default ProfileLayout