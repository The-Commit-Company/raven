import clsx from 'clsx'
import { Text, View } from 'react-native'

interface UnreadCountBadgeProps {
    count: number,
    prominent?: boolean
}

const UnreadCountBadge = ({ count, prominent = false }: UnreadCountBadgeProps) => {
    // If count is greater than 9, show 9+
    const displayCount = count > 9 ? '9+' : count
    return (
        <View className={clsx('px-2 py-1 rounded-md bg-card-background', { 'bg-primary': prominent })}>
            <Text
                style={{ fontVariant: ['tabular-nums'] }}
                className={clsx('text-[12px] text-foreground font-bold', { 'text-white': prominent })}>
                {displayCount}
            </Text>
        </View>
    )
}

export default UnreadCountBadge