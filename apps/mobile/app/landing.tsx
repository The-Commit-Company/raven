import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import AddSite from '@components/features/auth/AddSite';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Sites', headerTitle: 'Sites' }} />
            <View className='flex-1 py-8 px-4 gap-3'>
                <Text className='text-3xl font-bold'>raven</Text>
                <View className='h-2' />
                <AddSite />
            </View>
        </>
    );
}