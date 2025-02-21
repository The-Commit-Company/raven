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
        <View className='flex-row gap-2 items-baseline pb-1'>
            <Text className='font-medium text-sm'>{userFullName}</Text>
            <Text className='text-[13px] text-muted-foreground'>{timestamp}</Text>
        </View>
    )
}

export default MessageHeader