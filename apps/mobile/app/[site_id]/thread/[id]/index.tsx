import { Stack, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@hooks/useColorScheme';
import HeaderBackButton from '@components/common/HeaderBackButton';
import { ChatLayout } from '@components/features/chat/ChatLayout';
import ThreadActions from '@components/features/threads/thread-actions/ThreadActions';

const Thread = () => {

    const { id } = useLocalSearchParams()
    const { colors } = useColorScheme()

    return (
        <>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: colors.background },
                headerLeft: () => <HeaderBackButton />,
                headerTitle: 'Thread',
                headerRight: () => <ThreadActions />
            }} />
            <ChatLayout id={id as string} />
        </>
    )
}

export default Thread