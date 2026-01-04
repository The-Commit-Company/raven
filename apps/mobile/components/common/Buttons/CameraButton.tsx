import { useColorScheme } from "@hooks/useColorScheme"
import CameraIcon from "@assets/icons/CameraIcon.svg"
import { CustomFile } from "@raven/types/common/File"
import * as ImagePicker from 'expo-image-picker'
import { ActionButtonLarge } from "./ActionButtonLarge"
import { toast } from "sonner-native"
import { useTranslation } from 'react-i18next'

const CameraButton = ({ onPick }: { onPick: (files: CustomFile[]) => void }) => {

    const { t } = useTranslation()
    const { colors } = useColorScheme()

    const takePicture = async () => {
        try {
            let result = await ImagePicker.requestCameraPermissionsAsync().then((r) => {
                if (r.granted) {
                    return ImagePicker.launchCameraAsync({
                        mediaTypes: 'images',
                    })
                } else {
                    toast.error(t('media.cameraPermissionDenied'))
                    return null
                }
            })

            if (result && !result.canceled) {
                const parsedFiles = result.assets.map((asset) => {
                    const id = `captured_image_${Date.now()}.jpg`
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
            console.error('Error taking picture:', error)
            toast.error(t('media.cameraError'), {
                description: error instanceof Error ? error.message : t('errors.unknownError')
            })
        }
    }

    return (
        <ActionButtonLarge
            icon={<CameraIcon height={20} width={20} color={colors.icon} />}
            text={t('media.camera')}
            onPress={takePicture}
        />
    )
}

export default CameraButton