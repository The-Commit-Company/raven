import { Keyboard, NativeSyntheticEvent, ScrollView, TextInputChangeEventData, View } from "react-native"
import AdditionalInputs from "./AdditionalInputs"
import { Button } from "@components/nativewindui/Button"
import SendIcon from "@assets/icons/SendIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import SendItem from "./SendItem"
import { useAtom } from 'jotai'
import useFileUpload from "@raven/lib/hooks/useFileUpload"
import { useLocalSearchParams } from "expo-router"
import { CustomFile } from "@raven/types/common/File"
import { useCallback, useEffect, useState } from "react"
import { filesAtom } from "@lib/filesAtom"
import { MarkdownTextInput, parseExpensiMark } from "@expensify/react-native-live-markdown"
// import Tiptap from "./Tiptap/Tiptap"
import { cn } from "@lib/cn"
import { useSendMessage } from "@hooks/useSendMessage"
import Animated, {
    interpolate,
    useAnimatedStyle,
    withTiming,
    useSharedValue
} from "react-native-reanimated"
import { useKeyboardHandler } from "react-native-keyboard-controller"

const TIMING_CONFIG = {
    duration: 250,
}

const SHOW_TIMING_CONFIG = {
    duration: 150,
}

const ChatInput = () => {
    const { id } = useLocalSearchParams()
    const { uploadFiles } = useFileUpload(id as string)
    const [files, setFiles] = useAtom(filesAtom)
    const [content, setContent] = useState('Hello, *world*!')

    const handleCancelReply = () => {
        console.log('cancel reply')
    }

    const progress = useSharedValue(0)
    const isKeyboardClosing = useSharedValue(false)

    useKeyboardHandler({
        onMove: (event) => {
            "worklet";
            // Track if keyboard is closing to handle toolbar appearance
            isKeyboardClosing.value = event.progress < progress.value
            progress.value = event.progress
        },
    }, [])

    const toolbarStyles = useAnimatedStyle(() => {
        const shouldShowToolbar = progress.value < 0.6
        return {
            height: withTiming(
                shouldShowToolbar ? 60 : 0,
                shouldShowToolbar ? SHOW_TIMING_CONFIG : TIMING_CONFIG
            ),
            opacity: shouldShowToolbar ? 1 : 0,
            overflow: 'hidden',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10
        }
    })

    const containerStyles = useAnimatedStyle(() => {
        return {
            height: interpolate(
                progress.value,
                [0, 0.4, 1],
                [120, 100, 100]
            ),
        }
    })

    const editorContainerStyles = useAnimatedStyle(() => {
        return {
            flex: 1,
            paddingBottom: interpolate(
                progress.value,
                [0, 0.4, 1],
                [60, 0, 0]
            ),
            position: 'relative',
            zIndex: 2,
            minHeight: interpolate(
                progress.value,
                [0, 0.4, 1],
                [60, 100, 100]
            ),
        }
    })

    const { sendMessage, loading } = useSendMessage(id as string, files.length, uploadFiles, handleCancelReply)

    const handleSend = async (files?: CustomFile[]) => {

        console.log('html', content)

        // setText(content ?? '')

        if (files && files?.length > 0) {
            // set the caption to first file
            setFiles((prevFiles) => {
                return prevFiles.map((file) => {
                    if (file.fileID === files[0].fileID) {
                        return { ...file, caption: content }
                    }
                    return file
                })
            })

            setContent('')
        } else if (content) {
            console.log('content', content)
            await sendMessage(content)
            setContent('')
        }
    }

    const onEditorSendClicked = async (content?: string, json?: any) => {
        if (content) {
            return sendMessage(content, json).then(() => {
                setContent('')
            })
        }

        return Promise.resolve()
    }

    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

    useEffect(() => {
        const keyboardShowListener = Keyboard.addListener('keyboardWillShow', () => {
            setIsKeyboardVisible(true)
        })

        const keyboardHideListener = Keyboard.addListener('keyboardWillHide', () => {
            setIsKeyboardVisible(false)
        })

        return () => {
            keyboardShowListener.remove()
            keyboardHideListener.remove()
        }
    }, [])

    const onChange = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setContent(e.nativeEvent.text)
    }

    return (
        <Animated.View
            style={containerStyles}
            className={cn(
                "bg-white dark:bg-background gap-4 min-h-16",
                "border border-b-0 border-gray-300 dark:border-gray-900 rounded-t-lg",
            )}
        >
            <Animated.View
                style={editorContainerStyles}
                className="flex-row justify-start items-start flex-1">
                <MarkdownTextInput
                    value={content}
                    onChange={onChange}
                    parser={parseExpensiMark}
                />
                {/* <Tiptap
                    content={content}
                    isKeyboardVisible={isKeyboardVisible}
                    onSend={onEditorSendClicked}
                    onBlur={onEditorBlur}
                    dom={{
                        scrollEnabled: false,
                        matchContents: true,
                        containerStyle: {
                            paddingHorizontal: 4,
                            paddingTop: 4,
                            flex: 1,
                        },
                        // prefer expo dom view over react native webview as react native webview has internal scroll issue.
                        useExpoDOMWebView: true,
                    }}
                /> */}
            </Animated.View>
            <Animated.View
                style={toolbarStyles}
            >
                <InputBottomBar onSend={handleSend} />
            </Animated.View>
        </Animated.View>
    )
}

const InputBottomBar = ({ onSend }: { onSend: (files: CustomFile[]) => void }) => {
    const { colors } = useColorScheme()
    const [files] = useAtom(filesAtom)

    return (
        <View className="px-2 flex-1 gap-1">
            {files.length > 0 && <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 justify-start items-start py-2 pr-2">
                    {files.map((file) => (
                        <SendItem key={file.fileID} file={file} />
                    ))}
                </View>
            </ScrollView>
            }
            <View className="flex-row gap-4 justify-start items-start">
                <AdditionalInputs />
                <Button size='icon' variant="plain" className="absolute right-0" onPress={() => onSend(files)}>
                    <SendIcon fill={colors.primary} />
                </Button>
            </View>
        </View>
    )
}

export default ChatInput