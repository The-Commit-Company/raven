import { Text } from '@components/nativewindui/Text'
import { View } from 'react-native'
import { __ } from '@lib/i18n';
type Props = {
    title?: string
    description?: string
}

const FullPageLoader = ({ title, description }: Props) => {
const displayTitle = title ?? __("Raven")
    const displayDescription = description ?? __("Setting up your workspace...")

    return (
        <View className="flex-1 bg-background justify-center items-center gap-2">
            <Text className="text-4xl text-foreground font-cal-sans">{displayTitle}</Text>
            <Text className='text-muted-foreground'>{displayDescription}</Text>
        </View>
    )
}

export default FullPageLoader