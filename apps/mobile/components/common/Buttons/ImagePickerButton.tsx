import ImageUpIcon from "@assets/icons/ImageUpIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import * as ImagePicker from 'expo-image-picker'
import { CustomFile } from "@raven/types/common/File"
import { ActionButtonLarge } from "./ActionButtonLarge"
import { toast } from "sonner-native"
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

interface ImagePickerButtonProps {
    allowsMultipleSelection?: boolean
    mediaTypes?: ImagePicker.MediaType
    onPick: (files: CustomFile[]) => void
}

const ImagePickerButton = ({ allowsMultipleSelection, mediaTypes, onPick }: ImagePickerButtonProps) => {

    const { colors } = useColorScheme()

    const convertHEICtoJPEG = async (uri: string): Promise<string> => {
        try {
            const result = (await ImageManipulator.manipulate(uri).renderAsync()).saveAsync({
                format: SaveFormat.JPEG,
            })
            return (await result).uri
        } catch (error) {
            console.error('Error converting HEIC to JPEG:', error)
            throw error
        }
    }

    const pickImage = async () => {
        try {
            await ImagePicker.requestMediaLibraryPermissionsAsync()
            let result = await ImagePicker.launchImageLibraryAsync({
                allowsMultipleSelection: allowsMultipleSelection ?? true,
                mediaTypes: mediaTypes ?? ['videos', 'images', 'livePhotos'],
            })

            if (!result.canceled) {
                const parsedFiles = await Promise.all(result.assets.map(async (asset) => {

                    // Check if the image is HEIC format
                    const isHEIC = asset.mimeType?.toLowerCase().includes('heic')
                    const uri = isHEIC ? await convertHEICtoJPEG(asset.uri) : asset.uri

                    return {
                        uri,
                        name: isHEIC ? asset.fileName?.replace(/\.heic$/i, '.jpg') ?? 'image.jpg' : asset.fileName,
                        type: isHEIC ? 'image/jpeg' : asset.mimeType,
                        size: asset.fileSize,
                        fileID: asset.assetId,
                    } as any as CustomFile
                }))

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