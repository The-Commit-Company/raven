import { useColorScheme } from '@hooks/useColorScheme';
import { Stack } from 'expo-router';

const ProfileLayout = () => {

    const { colors, isDarkColorScheme } = useColorScheme()

    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: isDarkColorScheme ? colors.background : colors.card }
        }}>
            <Stack.Screen name='index'
                options={{
                    title: 'Profile',
                    headerLargeTitle: false,
                    contentStyle: { backgroundColor: isDarkColorScheme ? colors.background : colors.card }
                }} />
        </Stack>
    )
}

export default ProfileLayout