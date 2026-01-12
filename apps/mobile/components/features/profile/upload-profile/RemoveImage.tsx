import { Alert, Pressable } from 'react-native'
import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import { Text } from '@components/nativewindui/Text'
import TrashIcon from '@assets/icons/TrashIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import { __ } from '@lib/i18n';
interface RemoveImageProps {
    onSheetClose: (isMutate?: boolean) => void
}

const RemoveImage = ({ onSheetClose }: RemoveImageProps) => {
const { call } = useFrappePostCall('raven.api.raven_users.update_raven_user')

    const removeImage = async () => {
        try {
            await call({
                user_image: ''
            })
            toast.success(__("Profile picture removed."))
            onSheetClose()
        } catch (error) {
            toast.error(__("Error removing profile picture"))
        }
    }

    const deleteProfilePicAlert = () =>
        Alert.alert(
            __("Remove Image"),
            __("Are you sure you want to remove this image?"),
            [
                {
                    text: __("Cancel"),
                    style: 'cancel',
                },
                {
                    text: __("Remove"),
                    style: 'destructive',
                    onPress: removeImage
                },
            ]
        )

    const { isDarkColorScheme } = useColorScheme()

    return (
        <Pressable
            onPress={deleteProfilePicAlert}
            className='flex flex-row w-full items-center gap-2 p-2 rounded-lg ios:active:bg-red-50 dark:ios:active:bg-red-900/30'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <TrashIcon height={20} width={20} fill={isDarkColorScheme ? '#f87171' : '#dc2626'} />
            <Text className='text-base text-red-600 dark:text-red-400'>{__("Remove Image")}</Text>
        </Pressable>
    )
}

export default RemoveImage