import { useColorScheme } from "@hooks/useColorScheme"
import { CustomFile } from "@raven/types/common/File"
import * as ImagePicker from 'expo-image-picker'
import VideoCameraIcon from "@assets/icons/VideoCameraIcon.svg"
import { ActionButtonLarge } from "./ActionButtonLarge"
import { toast } from "sonner-native"

const VideoButton = ({ onPick }: { onPick: (files: CustomFile[]) => void }) => {

    const { colors } = useColorScheme()

    const takeVideo = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'videos',
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
            console.error('Error taking video:', error)
            toast.error("There was an error while launching the camera", {
                description: error instanceof Error ? error.message : "Unknown error"
            })
        }
    }

    return (
        <ActionButtonLarge
            icon={<VideoCameraIcon height={20} width={20} color={colors.icon} />}
            text="Video"
            onPress={takeVideo}
        />
    )
}

export default VideoButton