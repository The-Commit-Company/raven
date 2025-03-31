import { useColorScheme } from '@hooks/useColorScheme';
import { Stack } from 'expo-router';

const HomeLayout = () => {

    const { colors } = useColorScheme()

    return (
        <Stack initialRouteName='index'>
            <Stack.Screen name='index'
                options={{
                    title: 'Home',
                    headerShown: false,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.primary }
                }} />
            <Stack.Screen name='quick-search'
                options={{
                    presentation: 'modal',
                    headerStyle: { backgroundColor: colors.background }
                }} />
            <Stack.Screen name='create-channel'
                options={{
                    presentation: 'modal',
                    headerStyle: { backgroundColor: colors.background }
                }} />
            <Stack.Screen name='browse-channels'
                options={{
                    presentation: 'modal',
                    headerStyle: { backgroundColor: colors.background }
                }} />
            <Stack.Screen name='create-dm'
                options={{
                    presentation: 'modal',
                    headerStyle: { backgroundColor: colors.background }
                }} />
        </Stack>
    )
}

export default HomeLayout