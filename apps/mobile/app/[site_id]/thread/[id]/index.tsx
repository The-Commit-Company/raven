import { Stack, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@hooks/useColorScheme';
import HeaderBackButton from '@components/common/Buttons/HeaderBackButton';
import ThreadActions from '@components/features/threads/thread-actions/ThreadActions';
import ChatLayout from '@components/features/chat/ChatLayout';

const Thread = () => {

    const { id } = useLocalSearchParams()

    const { colors } = useColorScheme()

    return (
        <>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: colors.background },
                headerLeft: () => <HeaderBackButton />,
                headerTitle: 'Thread',
                headerRight: () => <ThreadActions threadID={id as string} />
            }} />
            <ChatLayout channelID={id as string} isThread />
        </>
    )
}

export default Thread