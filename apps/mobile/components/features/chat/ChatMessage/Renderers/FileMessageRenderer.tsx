import { Text } from '@components/nativewindui/Text'
import useFileURL from '@hooks/useFileURL'
import { getFileName } from '@raven/lib/utils/operations'
import { FileMessage } from '@raven/types/common/Message'
import { router } from 'expo-router'
import { Platform, View } from 'react-native'
import { useOpenFileOnAndroid } from '@hooks/useOpenFileOnAndroid'
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes'
import UniversalFileIcon from '@components/common/UniversalFileIcon'
import { Gesture, GestureDetector, TapGesture } from 'react-native-gesture-handler'
import { useCallback, useMemo } from 'react'
import { runOnJS } from 'react-native-reanimated'

type Props = {
    message: FileMessage
    doubleTapGesture: TapGesture
}

const FileMessageRenderer = ({ message, doubleTapGesture }: Props) => {

    const source = useFileURL((message as FileMessage).file ?? "");

    const { openFile: openFileOnAndroid } = useOpenFileOnAndroid()

    const handleFilePress = useCallback(() => {
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
    }, [source, openFileOnAndroid])

    /** Route to file viewer on single tap - but wait for double tap to fail */
    const singleTapGesture = useMemo(() => {
        return Gesture.Tap()
            .numberOfTaps(1)
            .hitSlop(10)
            .onStart(() => {
                runOnJS(handleFilePress)()
            }).requireExternalGestureToFail(doubleTapGesture)

    }, [handleFilePress, doubleTapGesture])

    return (
        <GestureDetector gesture={singleTapGesture}>
            <View className='flex-1 w-full pt-0.5' collapsable={false}>
                <FileMessageView message={message} />
            </View>
        </GestureDetector>
    )
}


export const FileMessageView = ({ message }: { message: FileMessage }) => {

    const fileName = getFileName(message.file)
    return <View className='rounded-lg mb-1 p-2 border border-linkColor dark:border-border bg-background w-full'>
        <View className='flex-row items-center gap-2 w-full'>
            <UniversalFileIcon fileName={fileName} height={28} width={28} />
            <Text className='text-base text-foreground line-clamp-1 truncate flex-1' numberOfLines={1}>
                {fileName}
            </Text>
        </View>
    </View>
}

export default FileMessageRenderer