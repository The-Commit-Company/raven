import { useFrappeFileUpload, useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import { useColorScheme } from '@hooks/useColorScheme'
import ImagePickerButton from '@components/common/ImagePickerButton'
import { CustomFile } from '@raven/types/common/File'
import PhotoAlbumIcon from '@assets/icons/PhotoAlbumIcon.svg'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator'

interface CameraButtonProps {
    onSheetClose: () => void
}

const CameraButton = ({ onSheetClose }: CameraButtonProps) => {

    const { colors } = useColorScheme()

    const { myProfile } = useCurrentRavenUser()

    const { call } = useFrappePostCall('raven.api.raven_users.update_raven_user')

    const { upload, loading } = useFrappeFileUpload()

    const uploadImage = async (file: string) => {
        if (file) {
            try {
                await call({
                    user_image: file
                })
                toast.success("Image uploaded successfully.")
                onSheetClose()
            } catch (error) {
                toast.error('Error while uploading profile image')
            }
        }
    }

    const onPick = async (files: CustomFile[]) => {
        const file = files[0]

        if (file) {

            try {
                const res = await upload(file, {
                    doctype: "Raven User",
                    docname: myProfile?.name,
                    fieldname: "user_image",
                    otherData: {
                        optimize: '1',
                    },
                    isPrivate: true,
                })
                await uploadImage(res.file_url)
            } catch (error) {
                console.error(error)
                toast.error('Error uploading image')
            }

        }
    }

    return (
        <ImagePickerButton
            label={loading ? "Uploading photo..." : "View photo library"}
            icon={loading ? <ActivityIndicator /> : <PhotoAlbumIcon width={20} height={20} fill={colors.icon} />}
            onPick={onPick}
            allowsMultipleSelection={false}
            buttonProps={{
                disabled: loading,
                className: "w-full justify-start",
                size: "icon"
            }}
            labelProps={{
                className: "text-base font-normal ml-2"
            }}
        />
    )
}

export default CameraButton