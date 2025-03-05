import * as Clipboard from 'expo-clipboard'
import { Message } from '@raven/types/common/Message'
import { toast } from 'sonner-native'
import { Pressable } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme'
import CopyIcon from "@assets/icons/CopyIcon.svg"

interface CopyMessageProps {
    message: Message
    onClose: () => void
}

const CopyMessage = ({ message, onClose }: CopyMessageProps) => {

    const { colors } = useColorScheme()
    const copy = useMessageCopy(message)

    return (
        <Pressable
            onPress={() => copy(onClose)}
            className='flex flex-row items-center gap-3 p-2 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <CopyIcon width={18} height={18} fill={colors.icon} />
            <Text className='text-base text-foreground'>Copy</Text>
        </Pressable>
    )
}

export default CopyMessage

export const useMessageCopy = (message: Message) => {

    const copy = async (onSuccess: () => void) => {
        if (!message) return

        if (message.message_type === 'Text') {
            // Remove all empty lines
            let text = message.text.replace(/^\s*[\r\n]/gm, "")

            // Simple HTML to plain text conversion
            const plainText = text.replace(/<[^>]+>/g, '')

            if (plainText) {
                await Clipboard.setStringAsync(plainText)
                toast.success('Text copied to clipboard')
                onSuccess()
            } else {
                toast.error('Could not copy text')
            }

        }
    }

    return copy
}