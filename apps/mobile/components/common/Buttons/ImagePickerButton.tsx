import ImageUpIcon from "@assets/icons/ImageUpIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import * as ImagePicker from 'expo-image-picker'
import { CustomFile } from "@raven/types/common/File"
import { ActionButtonLarge } from "./ActionButtonLarge"
import { toast } from "sonner-native"

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
                    return {
                        uri: asset.uri,
                        name: asset.fileName,
                        type: asset.mimeType,
                        size: asset.fileSize,
                        fileID: asset.assetId,
                    } as any as CustomFile
                })

                onPick(parsedFiles)
            }
        } catch (error) {
            console.error('Error picking images:', error)
            toast.error("There was an error while selecting images", {
                description: error instanceof Error ? error.message : "Unknown error"
            })
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