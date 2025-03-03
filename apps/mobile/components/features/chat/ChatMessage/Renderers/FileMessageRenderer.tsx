import { Text } from '@components/nativewindui/Text'
import useFileURL from '@hooks/useFileURL'
import { getFileName } from '@raven/lib/utils/operations'
import { FileMessage } from '@raven/types/common/Message'
import { router } from 'expo-router'
import { Platform, Pressable, View } from 'react-native'
import { useOpenFileOnAndroid } from '@hooks/useOpenFileOnAndroid'
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes'
import UniversalFileIcon from '@components/common/UniversalFileIcon'

type Props = {
    message: FileMessage
    onLongPress?: () => void
}

const FileMessageRenderer = ({ message, onLongPress }: Props) => {

    const fileName = getFileName(message.file)

    const source = useFileURL((message as FileMessage).file ?? "");

    const { openFile: openFileOnAndroid } = useOpenFileOnAndroid()

    const openFile = async () => {
        if (Platform.OS === 'ios') {
            router.push({
                pathname: './file-viewer',
                params: { uri: source?.uri },
            }, {
                relativeToDirectory: true
            })
        }
        else {
            openFileOnAndroid(source as WebViewSourceUri)
        }
    }

    return (
        <Pressable onPress={openFile} onLongPress={onLongPress} className='mb-1'>
            <View className='rounded-md p-2 border border-linkColor dark:border-border bg-background w-full'>
                <View className='flex-row items-center gap-2 p-2 w-full'>
                    <UniversalFileIcon fileName={fileName} />
                    <Text className='text-sm font-medium line-clamp-1 truncate flex-1' numberOfLines={1}>
                        {fileName}
                    </Text>
                </View>
            </View>
        </Pressable>
    )
}

export default FileMessageRenderer