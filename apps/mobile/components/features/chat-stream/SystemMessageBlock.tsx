import { Text } from '@components/nativewindui/Text'
import { SystemMessage } from '@raven/types/common/Message'
import { View } from 'react-native'

type Props = {
    item: SystemMessage
}

const SystemMessageBlock = ({ item }: Props) => {
    return (
        <View className='px-3 py-2'>
            <Text className='text-sm text-grayText'>{item.text}</Text>
        </View>
    )
}

export default SystemMessageBlock