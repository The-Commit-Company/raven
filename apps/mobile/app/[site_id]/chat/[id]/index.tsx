import { TextInput, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import { Text } from '@components/nativewindui/Text';
import ChatStream from '@components/features/chat-stream/ChatStream';
import FilePickerButton from '@components/common/FilePickerButton';
import { CustomFile } from '@raven/types/common/File';
import { atom, useSetAtom } from 'jotai'

export const filesAtom = atom<CustomFile[]>([])

const Chat = () => {
    const { id } = useLocalSearchParams();

    const setFiles = useSetAtom(filesAtom)

    console.log("Channel id: ", id);

    const handleFilePick = (files: CustomFile[]) => {
        setFiles(files)
        router.push('./file-send', {
            relativeToDirectory: true
        })
    }

    return (
        <>
            <Stack.Screen options={{
                title: id as string,
            }} />
            <View className='flex-1'>
                <ChatStream channelID={id as string} />
                <View className='h-24 fixed bottom-0 w-full bg-card'>
                    <View className='px-4 py-2 flex-row h-full w-full gap-2 items-center justify-center'>
                        <FilePickerButton onPick={handleFilePick} />
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