import { Text } from '@components/nativewindui/Text'
import { SystemMessage } from '@raven/types/common/Message'
import { View } from 'react-native'

type Props = {
    item: SystemMessage
}

const SystemMessageBlock = ({ item }: Props) => {
    return (
        <View className='px-4 py-2'>
            <Text className='text-sm text-muted-foreground'>{item.text}</Text>
        </View>
    )
}

export default SystemMessageBlock