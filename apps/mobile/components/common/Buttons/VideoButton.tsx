import { useColorScheme } from "@hooks/useColorScheme"
import { CustomFile } from "@raven/types/common/File"
import * as ImagePicker from 'expo-image-picker'
import VideoCameraIcon from "@assets/icons/VideoCameraIcon.svg"
import { ActionButtonLarge } from "./ActionButtonLarge"
import { toast } from "sonner-native"
import { useTranslation } from 'react-i18next'

const VideoButton = ({ onPick }: { onPick: (files: CustomFile[]) => void }) => {

    const { t } = useTranslation()
    const { colors } = useColorScheme()

    const takeVideo = async () => {
        try {
            let result = await ImagePicker.requestCameraPermissionsAsync().then((r) => {
                if (r.granted) {
                    return ImagePicker.launchCameraAsync({
                        mediaTypes: 'videos',
                        allowsEditing: true,
                    })
                } else {
                    toast.error(t('media.cameraPermissionDenied'))
                    return null
                }
            })
            if (result && !result.canceled) {
                const parsedFiles = result.assets.map((asset) => {
                    const id = `captured_video_${Date.now()}.mp4`
                    return {
                        uri: asset.uri,
                        name: asset.fileName ?? id,
                        type: asset.mimeType,
                        size: asset.fileSize,
                        fileID: asset.assetId ?? id,
                    } as any as CustomFile
                })

                onPick(parsedFiles)
            }
        } catch (error) {
            console.error('Error taking video:', error)
            toast.error(t('media.cameraError'), {
                description: error instanceof Error ? error.message : t('errors.unknownError')
            })
        }
    }

    return (
        <ActionButtonLarge
            icon={<VideoCameraIcon height={20} width={20} color={colors.icon} />}
            text={t('media.video')}
            onPress={takeVideo}
        />
    )
}

export default VideoButton