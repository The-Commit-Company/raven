import { Text } from '@components/nativewindui/Text'
import { DateBlock } from '@hooks/useChatStream'
import { View } from 'react-native'

type Props = {
    item: DateBlock
}

const DateSeparator = ({ item }: Props) => {
    return <View className='flex-1 flex-row items-center gap-2 pr-3 ml-3 my-1 pb-1 pt-4 border-b border-border/50'>
        <Text className='text-base font-semibold text-foreground'>{item.formattedDate}</Text>
    </View>
}

export default DateSeparator