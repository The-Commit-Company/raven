import { Button } from '@components/nativewindui/Button'
import { Text } from '@components/nativewindui/Text'
import useFileURL from '@hooks/useFileURL'
import { getFileName } from '@raven/lib/utils/operations'
import { FileMessage } from '@raven/types/common/Message'
import { router, useLocalSearchParams } from 'expo-router'
import { Platform, Pressable, View } from 'react-native'
import CopyIcon from '@assets/icons/CopyIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import { toast } from 'sonner-native'
import * as Clipboard from 'expo-clipboard';
import { useOpenFileOnAndroid } from '@hooks/useOpenFileOnAndroid'
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes'
import UniversalFileIcon from '@components/common/UniversalFileIcon'

type Props = {
    message: FileMessage
}

const FileMessageRenderer = ({ message }: Props) => {

    const { colors } = useColorScheme()

    const { site_id } = useLocalSearchParams<{ site_id: string }>()

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

    const copyLink = () => {
        if (message.file.startsWith('http') || message.file.startsWith('https')) {
            Clipboard.setStringAsync(message.file)
        }
        else {
            Clipboard.setStringAsync('https://' + site_id + message.file)
        }

        toast.success('Link copied')
    }


    return (
        <Pressable onPress={openFile} className='mb-1'>
            <View className='rounded-md p-2 border border-gray-100 dark:border-gray-700 w-[90%]'>
                <View className='flex-row items-center gap-2 p-2 w-full'>

                    <UniversalFileIcon fileName={fileName} />
                    <Text className='text-sm font-medium line-clamp-1 truncate flex-1 max-w-[80%]' numberOfLines={1}>
                        {fileName}
                    </Text>

                    <View className='flex-row items-center gap-2'>
                        <Button variant="plain" className="ios:px-0" hitSlop={10} onPress={copyLink}>
                            <CopyIcon width={16} height={16} fill={colors.icon} />
                        </Button>
                    </View>
                </View>

            </View>
        </Pressable>
    )
}

export default FileMessageRenderer