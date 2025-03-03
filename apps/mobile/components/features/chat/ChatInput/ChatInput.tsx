import { ScrollView, View } from "react-native"
import AdditionalInputs from "./AdditionalInputs"
import { Button } from "@components/nativewindui/Button"
import SendIcon from "@assets/icons/SendIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import SendItem from "./SendItem"
import { useAtom } from 'jotai'
import useFileUpload from "@raven/lib/hooks/useFileUpload"
import { useLocalSearchParams } from "expo-router"
import { CustomFile } from "@raven/types/common/File"
import { useState } from "react"
import { filesAtom } from "@lib/filesAtom"
import Tiptap from "./Tiptap/Tiptap"
import { cn } from "@lib/cn"
import { useKeyboardVisible } from "@hooks/useKeyboardVisible"
import { useSendMessage } from "@hooks/useSendMessage"

const ChatInput = () => {

    const { id } = useLocalSearchParams()
    const { uploadFiles } = useFileUpload(id as string)
    const [text, setText] = useState('')
    const [files, setFiles] = useAtom(filesAtom)

    // State to hold the measured width and height of the chat input.
    const { isKeyboardVisible } = useKeyboardVisible()

    const handleCancelReply = () => {
        console.log('cancel reply')
    }

    const { sendMessage, loading } = useSendMessage(id as string, files.length, uploadFiles, handleCancelReply)

    const handleSend = async (files?: CustomFile[], content?: string, json?: any) => {

        setText(content ?? '')

        if (files && files?.length > 0) {
            // set the caption to first file
            setFiles((prevFiles) => {
                return prevFiles.map((file) => {
                    if (file.fileID === files[0].fileID) {
                        return { ...file, caption: text }
                    }
                    return file
                })
            })
        } else if (content) {
            await sendMessage(content, json)
        }
    }

    return (
        <View className={cn(
            "bg-white dark:bg-background",
            "border border-b-0 border-gray-300 dark:border-gray-900 rounded-t-lg",
        )}>
            <View className="flex-row justify-start items-start">
                <Tiptap
                    content={text}
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
                    onSend={handleSend}
                    isKeyboardVisible={isKeyboardVisible}
                />
            </View>
            {
                !isKeyboardVisible && (
                    <InputBottomBar onSend={handleSend} />
                )
            }
        </View>
    )
}

const InputBottomBar = ({ onSend }: { onSend: (files: CustomFile[]) => void }) => {
    const { colors } = useColorScheme()
    const [files] = useAtom(filesAtom)

    return (
        <View className="px-2 py-1">
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 justify-start items-start py-2 pr-2">
                    {files.length > 0 && files.map((file) => (
                        <SendItem key={file.fileID} file={file} />
                    ))}
                </View>
            </ScrollView>
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