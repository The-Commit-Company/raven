import { Button, ButtonProps } from "@components/nativewindui/Button"
import AddFileIcon from "@assets/icons/AddFileIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import { SvgProps } from "react-native-svg"
import * as DocumentPicker from 'expo-document-picker'
import { CustomFile } from "@raven/types/common/File"
import { Text } from '@components/nativewindui/Text'
import { TextProps } from "react-native"

interface FilePickerButtonProps {
    buttonProps?: ButtonProps
    icon?: React.ReactNode
    iconProps?: SvgProps
    label?: string
    labelProps?: TextProps
    onPick: (files: CustomFile[]) => void
}

const FilePickerButton = ({ buttonProps, iconProps, icon, label, labelProps, onPick }: FilePickerButtonProps) => {
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
        <Button variant="plain" size={label ? "none" : "icon"} onPress={pickDocument} {...buttonProps} >
            {icon ?? <AddFileIcon height={20} width={20} color={colors.icon} {...iconProps} />}
            {label && <Text className=" text-sm text-foreground" {...labelProps}>{label}</Text>}
        </Button>
    )
}

export default FilePickerButton