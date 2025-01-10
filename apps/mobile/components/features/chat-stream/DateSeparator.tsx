import { Text } from '@components/nativewindui/Text'
import { DateBlock } from '@hooks/useChatStream'
import { View } from 'react-native'

type Props = {
    item: DateBlock
}

const DateSeparator = ({ item }: Props) => {
    return <View className='flex-1 flex-row items-center gap-2'>
        <View className='flex-1 h-px bg-border' />
        <Text className='text-sm text-center text-muted-foreground'>{item.creation}</Text>
        <View className='flex-1 h-px bg-border' />
    </View>
}

export default DateSeparator