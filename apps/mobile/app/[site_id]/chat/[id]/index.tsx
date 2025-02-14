import { KeyboardAvoidingView, Platform, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router';
import ChatStream from '@components/features/chat-stream/ChatStream';
import { useCurrentChannelData } from '@hooks/useCurrentChannelData';
import { useColorScheme } from '@hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardVisible } from '@hooks/useKeyboardVisible';
import ChatInput from '@components/features/chat/ChatInput/ChatInput';
import DMChannelHeader from '@components/features/chat/ChatHeader/DMChannelHeader';
import ChannelHeader from '@components/features/chat/ChatHeader/ChannelHeader';
import HeaderBackButton from '@components/common/HeaderBackButton';

const Chat = () => {

    const { bottom } = useSafeAreaInsets()
    const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible()
    const { id } = useLocalSearchParams()
    const { channel } = useCurrentChannelData(id as string)
    const colors = useColorScheme()

    return (
        <>
            <Stack.Screen options={{
                headerLeft: () => <HeaderBackButton />,
                title: id as string,
                headerRight: undefined,
                headerTitle: () => {
                    return (
                        <>
                            {channel && <>
                                {channel.type === 'dm' ?
                                    <DMChannelHeader channelData={channel.channelData} /> :
                                    <ChannelHeader channelData={channel.channelData} />
                                }
                            </>}
                        </>
                    )
                }
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

export default Chat