import { Pressable, TextProps } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import { ReactNode } from 'react'

interface ActionButtonLargeProps {
    icon: ReactNode
    text: string
    textProps?: TextProps
    onPress: () => void
}

export const ActionButtonLarge = ({ icon, text, textProps, onPress }: ActionButtonLargeProps) => {
    return (
        <Pressable
            onPress={onPress}
            className='flex-1 flex flex-col items-center gap-2 px-2 py-3.5 rounded-lg bg-card active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            {icon}
            <Text className='text-[15px] font-medium text-foreground/80' {...textProps}>{text}</Text>
        </Pressable>
    )
}