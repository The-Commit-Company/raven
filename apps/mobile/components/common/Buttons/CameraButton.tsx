import { useColorScheme } from "@hooks/useColorScheme"
import CameraIcon from "@assets/icons/CameraIcon.svg"
import { CustomFile } from "@raven/types/common/File"
import * as ImagePicker from 'expo-image-picker'
import { ActionButtonLarge } from "./ActionButtonLarge"
import { toast } from "sonner-native"

const CameraButton = ({ onPick }: { onPick: (files: CustomFile[]) => void }) => {

    const { colors } = useColorScheme()

    const takePicture = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                allowsEditing: true,
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
            console.error('Error taking picture:', error)
            toast.error("There was an error while launching the camera", {
                description: error instanceof Error ? error.message : "Unknown error"
            })
        }
    }

    return (
        <ActionButtonLarge
            icon={<CameraIcon height={20} width={20} color={colors.icon} />}
            text="Camera"
            onPress={takePicture}
        />
    )
}

export default CameraButton