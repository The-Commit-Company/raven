import { Alert } from 'react-native'
import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import { Button } from '@components/nativewindui/Button'
import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme'
import TrashIcon from '@assets/icons/TrashIcon.svg'

interface DeleteButtonProps {
    onSheetClose: (isMutate?: boolean) => void
}

const DeleteButton = ({ onSheetClose }: DeleteButtonProps) => {

    const { colors } = useColorScheme()

    const { call, loading } = useFrappePostCall('raven.api.raven_users.update_raven_user')

    const removeImage = async () => {
        try {
            await call({
                user_image: ''
            })
            toast.success("Profile picture removed.")
            onSheetClose()
        } catch (error) {
            toast.error('Error removing profile picture')
        }
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
        <Button
            onPress={deleteProfilePicAlert}
            className="w-full justify-start"
            variant='plain'
            size="icon"
            disabled={loading}
        >
            <TrashIcon height={20} width={20} fill={colors.destructive} />
            <Text className="text-base font-normal ml-2 text-destructive">{loading ? "Removing photo..." : "Remove photo"}</Text>
        </Button>
    )
}

export default DeleteButton