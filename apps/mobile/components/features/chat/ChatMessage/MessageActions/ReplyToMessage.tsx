import { Message } from '@raven/types/common/Message'
import { Pressable } from 'react-native'
import ReplyIcon from "@assets/icons/ReplyIcon.svg"
import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme'

interface ReplyToMessageProps {
    message: Message
    onClose: () => void
}

const ReplyToMessage = ({ message, onClose }: ReplyToMessageProps) => {

    const { colors } = useColorScheme()
    const onReplyToMessage = () => {
        console.log('reply to message')
    }

    return (
        <Pressable
            onPress={onReplyToMessage}
            className='flex-1 flex flex-col items-center gap-3 px-2 py-3 rounded-lg bg-card'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <ReplyIcon width={18} height={18} color={colors.icon} />
            <Text className='text-[15px] font-medium text-foreground/80'>Reply</Text>
        </Pressable>
    )
}

export default ReplyToMessage