import { Pressable, Animated } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import clsx from 'clsx'
import { useRef } from 'react'

interface ActionButtonProps {
    onPress: () => void
    icon: React.ReactNode
    text: string
    isDestructive?: boolean
    disabled?: boolean
}

const ActionButton = ({ onPress, icon, text, isDestructive = false, disabled = false }: ActionButtonProps) => {

    const scaleValue = useRef(new Animated.Value(1)).current

    const pressableClasses = clsx(
        'flex flex-row items-center gap-3 px-2 py-2.5 rounded-lg',
        {
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
            toValue: 0.98,
            stiffness: 400,
            damping: 20,
            useNativeDriver: true,
        }).start()
    }

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            stiffness: 400,
            damping: 20,
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
                {icon}
                <Text className={textClasses}>{text}</Text>
            </Pressable>
        </Animated.View>
    )
}

export default ActionButton