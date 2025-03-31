import { Text } from '@components/nativewindui/Text'
import { SystemMessage } from '@raven/types/common/Message'
import { View } from 'react-native'

type Props = {
    item: SystemMessage
}

const SystemMessageBlock = ({ item }: Props) => {

    return (
        <View className='flex-row gap-2.5 px-3 py-2 items-baseline'>
            <Text className='text-xs text-muted-foreground font-light'>{item.formattedTime}</Text>
            <Text className='text-sm text-muted-foreground'>{item.text}</Text>
        </View>
    )
}

export default SystemMessageBlock