import { KeyboardAvoidingView, Platform, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router';
import ChatStream from '@components/features/chat-stream/ChatStream';
import { CustomFile } from '@raven/types/common/File';
import { atom } from 'jotai'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardVisible } from '@hooks/useKeyboardVisible';
import ChatInput from '@components/features/chat/ChatInput/ChatInput';

const Chat = () => {

    const { bottom } = useSafeAreaInsets()
    const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible()

    const { id } = useLocalSearchParams();

    console.log("Channel id: ", id);

    return (
        <>
            <Stack.Screen options={{
                title: id as string,
            }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{
                    flex: 1,
                }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 90}
            >
                <ChatStream channelID={id as string} />
                {/* <View className='h-24 fixed bottom-0 w-full bg-card'>
                    <View className='px-4 py-2 flex-row h-full w-full gap-2 items-center justify-center'>
                        <FilePickerButton onPick={handleFilePick} />
                        <TextInput
                            placeholder='Type a message...'
                            className='border h-12 border-border w-[80%] rounded-lg p-2' />
                        <Button size='icon'><Text>S</Text></Button>
                    </View>
                </View> */}
                <View
                    className='px-4 py-2 w-full gap-2 items-center justify-center absolute'
                    style={{
                        bottom: isKeyboardVisible ? keyboardHeight : bottom,
                    }}
                >
                    <ChatInput />
                </View>
            </KeyboardAvoidingView>
        </>
    )
}

export default Chat