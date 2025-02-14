import { useFrappeFileUpload, useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import { useColorScheme } from '@hooks/useColorScheme'
import ImagePickerButton from '@components/common/ImagePickerButton'
import { CustomFile } from '@raven/types/common/File'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import CameraIcon from '@assets/icons/CameraIcon.svg'

const CameraButton = () => {

    const { call } = useFrappePostCall('raven.api.raven_users.update_raven_user')

    const { myProfile: currentUserInfo, mutate } = useCurrentRavenUser()

    const { upload, loading } = useFrappeFileUpload()

    const { colors } = useColorScheme()

    const uploadImage = (file: string) => {
        if (file) {
            call({
                user_image: file
            }).then(() => {
                toast("Image uploaded successfully.")
                mutate()
            }).catch((error) => {
                toast('Error while uploading profile image')
            })
        }
    }

    const onPick = (files: CustomFile[]) => {
        const file = files[0]

        if (file) {
            return upload(file, {
                doctype: "Raven User",
                docname: currentUserInfo?.name,
                fieldname: "user_image",
                otherData: {
                    optimize: '1',
                },
                isPrivate: true,
            }).then((res) => {
                uploadImage(res.file_url)
            }).catch(console.log)
        }
    }

    return (
        <ImagePickerButton
            icon={<CameraIcon width={12} height={12} fill="white" />}
            onPick={onPick}
            allowsMultipleSelection={false}
            buttonProps={{ style: { backgroundColor: colors.primary, height: 25, width: 25, borderRadius: 6 } }}
        />
    )
}

export default CameraButton