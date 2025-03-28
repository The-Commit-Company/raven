import { Text } from '@components/nativewindui/Text'
import { View } from 'react-native'

type Props = {
    is_continuation: 0 | 1,
    userFullName: string,
    timestamp: string
}

const MessageHeader = ({ is_continuation, userFullName, timestamp }: Props) => {

    if (is_continuation) return <View className='mt-1' />

    return (
        <View className='flex-row gap-2 items-baseline'>
            <Text className='font-semibold text-base'>{userFullName}</Text>
            <Text className='text-sm text-muted-foreground'>{timestamp}</Text>
        </View>
    )
}

export default MessageHeader