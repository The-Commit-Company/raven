import { Text } from '@components/nativewindui/Text'
import { View } from 'react-native'

type Props = {
    title?: string
    description?: string
}

const FullPageLoader = ({ title = 'raven', description = 'Setting up your workspace...' }: Props) => {
    return (
        <View className="flex-1 bg-background justify-center items-center gap-2">
            <Text className="text-4xl text-foreground font-cal-sans">{title}</Text>
            <Text className='text-muted-foreground'>{description}</Text>
        </View>
    )
}

export default FullPageLoader