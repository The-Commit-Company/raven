import { Button, ButtonProps } from "@components/nativewindui/Button"
import FileIcon from "@assets/icons/FileIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import { SvgProps } from "react-native-svg"
import * as DocumentPicker from 'expo-document-picker'

interface FilePickerButtonProps {
    buttonProps?: ButtonProps
    iconProps?: SvgProps
    onPick: (files: DocumentPicker.DocumentPickerAsset[]) => void
}

const FilePickerButton = ({ buttonProps, iconProps, onPick }: FilePickerButtonProps) => {

    const { colors } = useColorScheme()

    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync()

        if (!result.canceled) {
            onPick(result.assets)
        }
    }

    return (
        <Button variant="plain" size="icon" onPress={pickDocument} {...buttonProps} >
            <FileIcon height={20} width={20} color={colors.icon} {...iconProps} />
        </Button>
    )
}

export default FilePickerButton