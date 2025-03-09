import { Stack, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@hooks/useColorScheme';
import HeaderBackButton from '@components/common/HeaderBackButton';
import { ChatLayout } from '@components/features/chat/ChatLayout';

const Thread = () => {

    const { id } = useLocalSearchParams()
    const { colors } = useColorScheme()

    return (
        <>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: colors.background },
                headerLeft: () => <HeaderBackButton />,
                title: id as string,
                headerTitle: 'Thread'
            }} />
            <ChatLayout id={id as string} />
        </>
    )
}

export default Thread