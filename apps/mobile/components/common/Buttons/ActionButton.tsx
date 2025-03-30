import { Pressable, Animated, View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import clsx from 'clsx'
import { useRef } from 'react'
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';

interface ActionButtonProps {
    onPress: () => void
    icon: React.ReactNode
    text: string
    isDestructive?: boolean
    disabled?: boolean
    count?: number
    showChevron?: boolean
    chevronClassName?: string
}

const ActionButton = ({ onPress, icon, text, isDestructive = false, disabled = false, count, showChevron = false }: ActionButtonProps) => {

    const { colors } = useColorScheme()

    const scaleValue = useRef(new Animated.Value(1)).current

    const pressableClasses = clsx(
        'flex flex-row items-center rounded-lg',
        {
            'px-2 py-2.5 gap-3': !showChevron,
            'px-2 py-2.5 justify-between': showChevron,
            'active:bg-destructive/5 dark:active:bg-destructive/10': isDestructive,
            'active:bg-linkColor': !isDestructive,
            'opacity-50': disabled
        }
    )

    const textClasses = clsx(
        'text-base',
        {
            'text-red-600 dark:text-red-400': isDestructive,
            'text-foreground': !isDestructive
        }
    )

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.99,
            stiffness: 400,
            damping: 15,
            useNativeDriver: true,
        }).start()
    }

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            stiffness: 400,
            damping: 15,
            useNativeDriver: true,
        }).start()
    }

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                className={pressableClasses}
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
                disabled={disabled}>
                <View className="flex-row items-center gap-2.5">
                    {icon}
                    <Text className={textClasses}>{text}</Text>
                </View>
                {(showChevron || count !== undefined) ? (
                    <View className='flex-row items-center gap-1'>
                        {count !== undefined && count > 0 && (
                            <Text className='text-sm text-foreground font-semibold'>{count}</Text>
                        )}
                        {showChevron && (
                            <ChevronRightIcon height={24} width={24} fill={colors.foreground} strokeWidth={1} />
                        )}
                    </View>
                ) : null}
            </Pressable>
        </Animated.View>
    )
}

export default ActionButton