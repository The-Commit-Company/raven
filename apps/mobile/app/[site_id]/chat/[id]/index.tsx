import { TextInput, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import { Text } from '@components/nativewindui/Text';
import ChatStream from '@components/features/chat-stream/ChatStream';
import FilePickerButton from '@components/common/FilePickerButton';
import useFileUpload from '@raven/lib/hooks/useFileUpload';
import { useEffect } from 'react';

const Chat = () => {
    const { id } = useLocalSearchParams();

    const { uploadFiles, fileUploadProgress } = useFileUpload(id as string);

    console.log("Channel id: ", id);

    // useEffect(() => {
    //     console.log(fileUploadProgress);
    // }, [fileUploadProgress])

    return (
        <>
            <Stack.Screen options={{
                title: id as string,
            }} />
            <View className='flex-1'>
                <ChatStream channelID={id as string} />
                <View className='h-24 absolute bottom-0 w-full bg-white'>
                    <View className='px-4 py-2 flex-row h-full w-full gap-2 items-center justify-center'>
                        <FilePickerButton onPick={(assets) => {
                            const files = assets.map(asset => new File([asset.uri], asset.name, { type: asset.mimeType }));
                            uploadFiles(files);
                        }} />
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