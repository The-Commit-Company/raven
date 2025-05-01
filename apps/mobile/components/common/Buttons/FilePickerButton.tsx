import AddFileIcon from "@assets/icons/AddFileIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import * as DocumentPicker from 'expo-document-picker'
import { CustomFile } from "@raven/types/common/File"
import { Text } from '@components/nativewindui/Text'
import { Pressable } from "react-native"
import { toast } from "sonner-native"

interface FilePickerButtonProps {
    onPick: (files: CustomFile[]) => void
}

const FilePickerButton = ({ onPick }: FilePickerButtonProps) => {

    const { colors } = useColorScheme()
    const pickDocument = async () => {
        try {
            let result = await DocumentPicker.getDocumentAsync({
                multiple: true
            })

            if (!result.canceled) {
                const parsedFiles = result.assets.map((asset) => {
                    return {
                        uri: asset.uri,
                        name: asset.name,
                        type: asset.mimeType,
                        size: asset.size,
                        fileID: asset.name + Date.now(),
                    } as any as CustomFile
                })

                onPick(parsedFiles)
            }
        } catch (error) {
            console.error('Error picking documents:', error)
            toast.error("There was an error while selecting documents", {
                description: error instanceof Error ? error.message : "Unknown error"
            })
        }
    }

    return (
        <Pressable
            onPress={pickDocument}
            hitSlop={10}
            className='flex flex-row w-full items-center gap-2 p-2 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <AddFileIcon height={20} width={20} color={colors.icon} />
            <Text className='text-base text-foreground'>Upload Document</Text>
        </Pressable>
    )
}

export default FilePickerButton