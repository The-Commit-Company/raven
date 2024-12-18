import { useColorScheme } from '@hooks/useColorScheme';
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
                    headerLargeTitle: false
                }} />
        </Stack>
    )
}

export default HomeLayout