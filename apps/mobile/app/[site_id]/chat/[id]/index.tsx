

import { TextInput, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import { Text } from '@components/nativewindui/Text';
import ChatStream from '@components/features/chat-stream/ChatStream';

const Chat = () => {
    const { id } = useLocalSearchParams();

    console.log("Channel id: ", id);

    return (
        <>
            <Stack.Screen options={{
                headerBackButtonDisplayMode: 'minimal',
                title: id as string,
            }} />
            <View className='flex-1'>
                <ChatStream channelID={id as string} />
                <View className='h-24 absolute bottom-0 w-full bg-white'>
                    <View className='px-4 py-2 flex-row h-full w-full gap-2 items-center justify-center'>
                        <TextInput
                            placeholder='Type a message...'
                            className='border h-12 border-border w-[80%] rounded-lg p-2' />
                        <Button size='icon'><Text>S</Text></Button>
                    </View>
                </View>
            </View>
        </>
    )
}

export default Chat