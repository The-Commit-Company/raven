import { useColorScheme } from '@hooks/useColorScheme';
import { Stack } from 'expo-router';

const HomeLayout = () => {

    const { colors } = useColorScheme()

    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.primary }
        }}>
            <Stack.Screen name='index'
                options={{
                    title: 'Home',
                    headerShown: false
                }} />
        </Stack>
    )
}

export default HomeLayout