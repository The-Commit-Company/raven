import { useColorScheme } from '@hooks/useColorScheme';
import { Stack } from 'expo-router';

const HomeLayout = () => {

    const { colors } = useColorScheme()

    return (
        <Stack>
            <Stack.Screen name='index'
                options={{
                    title: 'Home',
                    headerShown: false,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.primary }
                }} />
            <Stack.Screen name='create-channel'
                options={{
                    presentation: 'modal',
                    headerStyle: { backgroundColor: colors.background }
                }} />
        </Stack>
    )
}

export default HomeLayout