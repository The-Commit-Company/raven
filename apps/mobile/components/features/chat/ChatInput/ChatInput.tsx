import { NativeSyntheticEvent, ScrollView, TextInputChangeEventData, View } from "react-native"
import AdditionalInputs from "./AdditionalInputs"
import { Button } from "@components/nativewindui/Button"
import SendIcon from "@assets/icons/SendIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import SendItem from "./SendItem"
import { useAtom } from 'jotai'
import useFileUpload from "@raven/lib/hooks/useFileUpload"
import { useLocalSearchParams } from "expo-router"
import { CustomFile } from "@raven/types/common/File"
import { useCallback, useState } from "react"
import { filesAtom } from "@lib/filesAtom"
import { MarkdownTextInput, parseExpensiMark } from "@expensify/react-native-live-markdown"
import { useSendMessage } from "@hooks/useSendMessage"

const ChatInput = () => {
    const { id } = useLocalSearchParams()
    const { uploadFiles } = useFileUpload(id as string)
    const [files, setFiles] = useAtom(filesAtom)
    const [content, setContent] = useState('Hello, *world*!')

    const handleCancelReply = () => {
        console.log('cancel reply')
    }


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

    const onChange = useCallback((e: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setContent(e.nativeEvent.text)
    }, [])

    const { colors } = useColorScheme()

    return <View className="flex flex-col bg-background">
        {files.length > 0 && <View className="px-2 py-1 border-t border-border">
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 justify-start items-start py-2 pr-2">
                    {files.map((file) => (
                        <SendItem key={file.fileID} file={file} />
                    ))}
                </View>
            </ScrollView>
        </View>
        }
        <View className="flex-row items-center px-4 gap-2 min-h-16 justify-between">
            <AdditionalInputs />
            <InputComponent content={content} onChange={onChange} />
            <View>
                <Button size='icon' variant="plain" className="w-8 h-8" hitSlop={10}>
                    <SendIcon fill={colors.primary} />
                </Button>
            </View>
        </View>
    </View>
}

interface InputComponentProps {
    content: string
    onChange: (e: NativeSyntheticEvent<TextInputChangeEventData>) => void
}

const InputComponent = ({ content, onChange }: InputComponentProps) => {
    return <View className="flex-1 border-border border p-2 rounded-lg w-full min-h-8">
        <MarkdownTextInput
            value={content}
            placeholder="Type a message"
            onChange={onChange}
            parser={parseExpensiMark}
        />
    </View>
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