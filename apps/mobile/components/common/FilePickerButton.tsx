import { Button, ButtonProps } from "@components/nativewindui/Button"
import FileIcon from "@assets/icons/FileIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import { SvgProps } from "react-native-svg"
import * as DocumentPicker from 'expo-document-picker'
import { CustomFile } from "@raven/types/common/File"

interface FilePickerButtonProps {
    buttonProps?: ButtonProps
    icon?: React.ReactNode
    iconProps?: SvgProps
    onPick: (files: CustomFile[]) => void
}

const FilePickerButton = ({ buttonProps, iconProps, icon, onPick }: FilePickerButtonProps) => {
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
            } else {
                console.log('Document picking was canceled.')
            }
        } catch (error) {
            console.error('Error picking documents:', error)
        }
    }

    return (
        <Button variant="plain" size="icon" onPress={pickDocument} {...buttonProps} >
            {icon ?? <FileIcon height={20} width={20} color={colors.icon} {...iconProps} />}
        </Button>
    )
}

export default FilePickerButton