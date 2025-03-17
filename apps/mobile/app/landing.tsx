import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import AddSite from '@components/features/auth/AddSite';
import SitesList from '@components/features/auth/SitesList';

export default function LandingScreen() {

    return (
        <>
            <Stack.Screen options={{ title: 'Sites', headerShown: false }} />
            <View className='flex-1 justify-center pt-48 px-6 gap-3 bg-background'>
                <Text className='text-5xl font-cal-sans text-foreground'>raven</Text>
                <View className='h-2' />
                <SitesList />
                <AddSite />
            </View>
        </>
    );
}