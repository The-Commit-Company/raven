import { View } from 'react-native';
import { Stack } from 'expo-router';
import ThreadTabs from '@components/features/threads/ThreadTabs';
import { useColorScheme } from '@hooks/useColorScheme';
import CommonErrorBoundary from '@components/common/CommonErrorBoundary';

export default function Threads() {
    const { colors } = useColorScheme()

    return (
        <>
            <Stack.Screen options={{
                title: 'Threads',
                headerLargeTitle: false,
                headerStyle: { backgroundColor: colors.background },
            }} />
            <View className='flex-1 pb-24'>
                <ThreadTabs />
            </View>
        </>
    )
}

export const ErrorBoundary = CommonErrorBoundary