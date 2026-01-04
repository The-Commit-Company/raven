import { Alert, Pressable } from 'react-native'
import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import { Text } from '@components/nativewindui/Text'
import TrashIcon from '@assets/icons/TrashIcon.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import { useTranslation } from 'react-i18next'

interface RemoveImageProps {
    onSheetClose: (isMutate?: boolean) => void
}

const RemoveImage = ({ onSheetClose }: RemoveImageProps) => {

    const { t } = useTranslation()
    const { call } = useFrappePostCall('raven.api.raven_users.update_raven_user')

    const removeImage = async () => {
        try {
            await call({
                user_image: ''
            })
            toast.success(t('profile.imageRemoved'))
            onSheetClose()
        } catch (error) {
            toast.error(t('profile.imageRemoveFailed'))
        }
    }

    const deleteProfilePicAlert = () =>
        Alert.alert(
            t('profile.removeImage'),
            t('profile.removeImageConfirm'),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('common.remove'),
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
            <Text className='text-base text-red-600 dark:text-red-400'>{t('profile.removeImage')}</Text>
        </Pressable>
    )
}

export default RemoveImage