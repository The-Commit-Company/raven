import { useFrappeFileUpload, useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import ImagePickerButton from '@components/common/Buttons/ImagePickerButton'
import { CustomFile } from '@raven/types/common/File'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'

interface UploadImageProps {
    onSheetClose: () => void
}

const UploadImage = ({ onSheetClose }: UploadImageProps) => {

    const { myProfile } = useCurrentRavenUser()

    const { call } = useFrappePostCall('raven.api.raven_users.update_raven_user')

    const { upload } = useFrappeFileUpload()

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
                    isPrivate: false,
                })
                await uploadImage(res.file_url)
            } catch (error) {
                console.error(error)
                toast.error('Error uploading image')
            }

        }
    }

    return (
        <ImagePickerButton onPick={onPick} allowsMultipleSelection={false} />
    )
}

export default UploadImage