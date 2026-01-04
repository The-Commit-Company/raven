import { Text } from '@components/nativewindui/Text'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

type Props = {
    title?: string
    description?: string
}

const FullPageLoader = ({ title, description }: Props) => {
    const { t } = useTranslation()
    const displayTitle = title ?? t('common.appName')
    const displayDescription = description ?? t('workspaces.settingUp')

    return (
        <View className="flex-1 bg-background justify-center items-center gap-2">
            <Text className="text-4xl text-foreground font-cal-sans">{displayTitle}</Text>
            <Text className='text-muted-foreground'>{displayDescription}</Text>
        </View>
    )
}

export default FullPageLoader