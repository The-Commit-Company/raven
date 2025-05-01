import ImageUpIcon from "@assets/icons/ImageUpIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import * as ImagePicker from 'expo-image-picker'
import { CustomFile } from "@raven/types/common/File"
import { ActionButtonLarge } from "./ActionButtonLarge"
import { Platform } from "react-native"

interface ImagePickerButtonProps {
    allowsMultipleSelection?: boolean
    mediaTypes?: ImagePicker.MediaType
    onPick: (files: CustomFile[]) => void
}

const ImagePickerButton = ({ allowsMultipleSelection, mediaTypes, onPick }: ImagePickerButtonProps) => {

    const { colors } = useColorScheme()
    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                allowsMultipleSelection: allowsMultipleSelection ?? true,
                mediaTypes: mediaTypes ?? ['videos', 'images', 'livePhotos'],
            })

            if (!result.canceled) {
                const parsedFiles = result.assets.map((asset) => {

                    let fileName = asset.fileName
                    if (Platform.OS === 'ios' && (fileName?.endsWith('.heic') || fileName?.endsWith('.heif') || fileName?.endsWith('.HEIC') || fileName?.endsWith('.HEIF'))) {
                        fileName = fileName.replace('.heic', '.jpg').replace('.heif', '.jpg').replace('.HEIC', '.jpg').replace('.HEIF', '.jpg')
                    }
                    return {
                        uri: asset.uri,
                        name: fileName,
                        type: asset.mimeType,
                        size: asset.fileSize,
                        fileID: asset.assetId,
                    } as any as CustomFile
                })

                onPick(parsedFiles)
            }
        } catch (error) {
            console.error('Error picking images:', error)
        }
    }

    return (
        <ActionButtonLarge
            icon={<ImageUpIcon height={20} width={20} color={colors.icon} />}
            text="Gallery"
            onPress={pickImage}
        />
    )
}

export default ImagePickerButton