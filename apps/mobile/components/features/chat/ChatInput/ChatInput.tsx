import { ScrollView, TextInput, View } from "react-native"
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

const ChatInput = () => {

    const { id } = useLocalSearchParams()
    const { uploadFiles } = useFileUpload(id as string)
    const [text, setText] = useState('')
    const [, setFiles] = useAtom(filesAtom)

    const handleSend = (files: CustomFile[]) => {
        if (files?.length > 0) {
            files[0].caption = text
            uploadFiles(files, setFiles).then(() => {
                setText('')
                setFiles([])
            })
        }
    }

    return (
        <View className="flex-col gap-2 w-full">
            <TextInput
                placeholder='Type a message...'
                className="color-foreground w-full"
                onChangeText={(text) => setText(text)}
                value={text}
            />
            <InputBottomBar onSend={handleSend} />
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