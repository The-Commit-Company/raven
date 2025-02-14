import { Alert, TouchableOpacity } from 'react-native'
import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import TrashIcon from '@assets/icons/TrashIcon.svg'

const DeleteButton = () => {

    const { call, loading, error } = useFrappePostCall('raven.api.raven_users.update_raven_user')
    const { mutate } = useCurrentRavenUser()

    const removeImage = () => {
        call({
            user_image: ''
        }).then(() => {
            toast.success("Profile picture removed.")
            mutate()
        })
    }

    const deleteProfilePicAlert = () =>
        Alert.alert(
            `Remove Image`,
            `Are you sure you want to remove this image?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: removeImage
                },
            ]
        )

    return (
        <TouchableOpacity disabled={loading} activeOpacity={0.8} onPress={deleteProfilePicAlert} className='p-1.5 rounded-md bg-gray-50'>
            <TrashIcon width={12} height={12} fill={"red"} />
        </TouchableOpacity>
    )
}

export default DeleteButton