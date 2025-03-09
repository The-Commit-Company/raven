import { useColorScheme } from '@hooks/useColorScheme'
import { Message } from '@raven/types/common/Message'
import { router } from 'expo-router'
import { Pressable } from 'react-native'
import ForwardIcon from "@assets/icons/ForwardIcon.svg"
import { Text } from '@components/nativewindui/Text'

interface ForwardMessageProps {
    message: Message
    onClose: () => void
}

const ForwardMessage = ({ message, onClose }: ForwardMessageProps) => {

    const forwardMessage = () => {
        router.push({
            pathname: "../../forward-message",
            params: { ...message }
        }, { relativeToDirectory: true })
        onClose()
    }

    const { colors } = useColorScheme()

    return (
        <Pressable
            onPress={forwardMessage}
            className='flex-1 flex flex-col items-center gap-3 px-2 py-3 rounded-lg bg-card'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <ForwardIcon width={18} height={18} color={colors.icon} />
            <Text className='text-[15px] font-medium text-foreground/80'>Forward</Text>
        </Pressable>
    )
}

export default ForwardMessage