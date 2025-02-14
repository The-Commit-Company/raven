import { ScrollView, TextInput, useWindowDimensions, View } from "react-native"
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

const ChatInput = () => {

    const { id } = useLocalSearchParams()
    const { uploadFiles } = useFileUpload(id as string)
    const [text, setText] = useState('')
    const [, setFiles] = useAtom(filesAtom)

    const { width, } = useWindowDimensions()

    // State to hold the measured width and height of the chat input.
    const [inputSize, setInputSize] = useState<{ width: number; height: number }>({
        width: width - 24,
        height: 40,
    });

    const handleSend = async (files?: CustomFile[], content?: string, json?: any) => {

        if (files && files?.length > 0) {
            files[0].caption = text
            uploadFiles(files, setFiles).then(() => {
                setText('')
                setFiles([])
            })
        } else if (content) {
            console.log(content, json)
        }
    }

    return (
        <View className="flex-col gap-2 w-full">
            {
                <Tiptap
                    content={text}
                    dom={{
                        scrollEnabled: false,
                        matchContents: true,
                        // We use the measured size, which helps avoid an internal scroll in the WebView.
                        containerStyle: {
                            width: inputSize.width,
                            height: inputSize.height,
                            overflow: "hidden",
                        },
                    }}

                    // This callback is invoked from the web side whenever the size changes.
                    onDOMLayout={({ width, height }: { width: number, height: number }) => {
                        // Only update if the size has really changed
                        if (inputSize.width !== width || inputSize.height !== height) {
                            setInputSize({ width, height });
                        }
                    }}
                    onSend={handleSend}
                />
            }
            {/* <InputBottomBar onSend={handleSend} /> */}
        </View>
    )
}

const InputBottomBar = ({ onSend }: { onSend: (files: CustomFile[]) => void }) => {
    const { colors } = useColorScheme()
    const [files] = useAtom(filesAtom)

    return (
        <View>
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