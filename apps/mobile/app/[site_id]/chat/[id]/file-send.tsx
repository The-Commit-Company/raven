import { Animated, Platform, View } from "react-native"
import PagerView from 'react-native-pager-view'
import { filesAtom } from "."
import { useAtom } from 'jotai'
import { Stack } from "expo-router"
import { useState } from "react"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useKeyboardVisible } from "@hooks/useKeyboardVisible"
import { useRef } from "react"
import { CustomFile } from "@raven/types/common/File"
import FilePager from "@components/features/file-upload/FilePager"
import CaptionInput from "@components/features/file-upload/CaptionInput"

const FileSend = () => {
    const [files, setFiles] = useAtom(filesAtom)
    const [selectedFile, setSelectedFile] = useState<CustomFile>(files[0])
    const { bottom } = useSafeAreaInsets()
    const { isKeyboardVisible } = useKeyboardVisible()
    const pagerRef = useRef<PagerView>(null)

    const captionOpacity = useRef(new Animated.Value(0)).current

    const fadeIn = () => {
        Animated.timing(captionOpacity, {
            toValue: 1,
            duration: 170,
            useNativeDriver: true,
        }).start()
    }

    const fadeOut = () => {
        Animated.timing(captionOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start()
    }

    const onCaptionChange = (caption: string) => {
        setSelectedFile((prevFileInfo: CustomFile) => {
            return { ...prevFileInfo, caption }
        })
        setFiles((prevFiles) => {
            return prevFiles.map((file) => {
                if (file.fileID === selectedFile.fileID) {
                    return { ...file, caption }
                }
                return file
            })
        })
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{
                flex: 1,
            }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 90}
        >
            <Stack.Screen options={{
                title: 'Send Files',
                headerShown: true,
                headerTitle: selectedFile?.name ?? '',
            }} />
            <FilePager files={files} setSelectedFile={setSelectedFile} pagerRef={pagerRef} setFiles={setFiles} fadeIn={fadeIn} fadeOut={fadeOut} />
            <View
                className='px-4 py-2 w-full gap-2 items-center justify-center'
                style={{
                    bottom: isKeyboardVisible ? 0 : bottom,
                }}
            >
                <CaptionInput files={files} setFiles={setFiles} onCaptionChange={onCaptionChange} selectedFile={selectedFile} opacity={captionOpacity} />
            </View>
        </KeyboardAvoidingView>
    )
}

export default FileSend