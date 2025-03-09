import { Keyboard, ScrollView, View } from "react-native"
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
import Tiptap from "./Tiptap/Tiptap"
import { cn } from "@lib/cn"
import { useSendMessage } from "@hooks/useSendMessage"
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { useKeyboardHandler } from "react-native-keyboard-controller"

const ChatInput = () => {

    const { id } = useLocalSearchParams()
    const { uploadFiles } = useFileUpload(id as string)

    const [files, setFiles] = useAtom(filesAtom)

    const [content, setContent] = useState('')
    const [json, setJSON] = useState<any>(null)

    const handleCancelReply = () => {
        console.log('cancel reply')
    }

    // const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
    const progress = useSharedValue(0)

    useKeyboardHandler({
        onMove: (event) => {
            "worklet";
            progress.value = event.progress
        },
    }, [])

    const toolbarStyles = useAnimatedStyle(() => {
        return {
            height: interpolate(progress.value, [0, 1], [60, 0]),
            opacity: 1 - progress.value,
        }
    })

    const { sendMessage, loading } = useSendMessage(id as string, files.length, uploadFiles, handleCancelReply)

    const handleSend = async (files?: CustomFile[]) => {

        console.log('html', content, json)

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
            setJSON(null)
        } else if (content) {
            console.log('content', content)
            await sendMessage(content, json)
            setContent('')
            setJSON(null)
        }
    }

    const onEditorSendClicked = async (content?: string, json?: any) => {
        if (content) {
            return sendMessage(content, json).then(() => {
                setContent('')
                setJSON(null)
            })
        }

        return Promise.resolve()
    }

    const onEditorBlur = useCallback((content: string, json: any) => {
        setContent(content)
        setJSON(json)
    }, [])

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

    return (
        <View
            className={cn(
                "bg-white dark:bg-background gap-4",
                "border border-b-0 border-gray-300 dark:border-gray-900 rounded-t-lg",
            )}
        >
            <View className="flex-row justify-start items-start">
                <Tiptap
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
                        },
                        // prefer expo dom view over react native webview as react native webview has internal scroll issue.
                        useExpoDOMWebView: true,
                    }}
                />
            </View>
            <Animated.View style={toolbarStyles}>
                <InputBottomBar onSend={handleSend} />
            </Animated.View>
        </View>
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