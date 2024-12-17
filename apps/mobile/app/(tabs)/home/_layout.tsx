import { useColorScheme } from '@lib/useColorScheme';
import { Stack } from 'expo-router';

const HomeLayout = () => {

    const { colors } = useColorScheme()

    return (
        <Stack screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background }
        }}>
            <Stack.Screen name='index'
                options={{
                    title: 'Home',
                    headerLargeTitle: true
                }} />
        </Stack>
    )
}

export default HomeLayout