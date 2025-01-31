import { Button, ButtonProps } from "@components/nativewindui/Button"
import ImageUpIcon from "@assets/icons/ImageUpIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import { SvgProps } from "react-native-svg"
import * as ImagePicker from 'expo-image-picker'
import { CustomFile } from "@raven/types/common/File"
import { Text } from '@components/nativewindui/Text'
import { TextProps } from "react-native"

interface ImagePickerButtonProps {
    buttonProps?: ButtonProps
    icon?: React.ReactNode
    iconProps?: SvgProps
    label?: string
    labelProps?: TextProps
    onPick: (files: CustomFile[]) => void
}

const ImagePickerButton = ({ buttonProps, iconProps, icon, label, labelProps, onPick }: ImagePickerButtonProps) => {
    const { colors } = useColorScheme()

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                allowsMultipleSelection: true,
            })

            if (!result.canceled) {
                const parsedFiles = result.assets.map((asset) => {
                    return {
                        uri: asset.uri,
                        name: asset.fileName,
                        type: asset.mimeType,
                        size: asset.fileSize,
                        fileID: asset.assetId,
                    } as any as CustomFile
                })

                onPick(parsedFiles)
            } else {
                console.log('Image picking was canceled.')
            }
        } catch (error) {
            console.error('Error picking images:', error)
        }
    }

    return (
        <Button variant="plain" size={label ? "none" : "icon"} onPress={pickImage} {...buttonProps} >
            {icon ?? <ImageUpIcon height={20} width={20} color={colors.icon} {...iconProps} />}
            {label && <Text className=" text-sm text-foreground" {...labelProps}>{label}</Text>}
        </Button>
    )
}

export default ImagePickerButton