import { KeyboardAvoidingView, Platform, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router';
import ChatStream from '@components/features/chat-stream/ChatStream';
import { useColorScheme } from '@hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardVisible } from '@hooks/useKeyboardVisible';
import ChatInput from '@components/features/chat/ChatInput/ChatInput';
import HeaderBackButton from '@components/common/HeaderBackButton';

const Thread = () => {

    const { bottom } = useSafeAreaInsets()
    const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible()
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
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 90}>
                <ChatStream channelID={id as string} />
                <View
                    className='px-4 py-2 w-full gap-2 items-center justify-center absolute'
                    style={{ bottom: isKeyboardVisible ? keyboardHeight : bottom }}>
                    <ChatInput />
                </View>
            </KeyboardAvoidingView>
        </>
    )
}

export default Thread