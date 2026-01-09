import { Text } from '@components/nativewindui/Text'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

type Props = {}

const OfflineBanner = (props: Props) => {
    const { t } = useTranslation()
    return (
        <SafeAreaView edges={['top', 'left', 'right']} className='bg-card-foreground py-2'>
            <Text className='text-sm text-center text-background'>{t('auth.offlineMessage')}</Text>
        </SafeAreaView>
    )
}

export default OfflineBanner