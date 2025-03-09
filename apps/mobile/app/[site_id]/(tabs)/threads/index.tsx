import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import ThreadTabs from '@components/features/threads/ThreadTabs';
import { useColorScheme } from '@hooks/useColorScheme';

export default function Threads() {

    const insets = useSafeAreaInsets()
    const { colors } = useColorScheme()

    return (
        <>
            <Stack.Screen options={{
                title: 'Threads',
                headerLargeTitle: false,
                headerStyle: { backgroundColor: colors.background },
            }} />
            <View className='flex-1'>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: insets.bottom }}>
                    <ThreadTabs />
                </ScrollView>
            </View>
        </>
    )
}