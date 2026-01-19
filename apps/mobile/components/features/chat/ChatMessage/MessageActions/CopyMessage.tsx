import * as Clipboard from 'expo-clipboard'
import { Message } from '@raven/types/common/Message'
import { toast } from 'sonner-native'
import { useColorScheme } from '@hooks/useColorScheme'
import CopyIcon from "@assets/icons/CopyIcon.svg"
import ActionButton from '@components/common/Buttons/ActionButton'
import { __ } from '@lib/i18n';
interface CopyMessageProps {
    message: Message
    onClose: () => void
}

const CopyMessage = ({ message, onClose }: CopyMessageProps) => {
const { colors } = useColorScheme()
    const copy = useMessageCopy(message)

    return (
        <ActionButton
            onPress={() => copy(onClose)}
            icon={<CopyIcon width={18} height={18} fill={colors.icon} />}
            text={__("Copy")}
        />
    )
}

export default CopyMessage

export const useMessageCopy = (message: Message, t?: (key: string) => string) => {

    const copy = async (onSuccess: () => void) => {
        if (!message) return

        if (message.message_type === 'Text') {
            // Remove all empty lines
            let text = message.text.replace(/^\s*[\r\n]/gm, "")

            // Simple HTML to plain text conversion
            const plainText = text.replace(/<[^>]+>/g, '')

            if (plainText) {
                await Clipboard.setStringAsync(plainText)
                toast.success(t ? __("Text copied to clipboard") : 'Text copied to clipboard')
                onSuccess()
            } else {
                toast.error(t ? __("Could not copy text") : 'Could not copy text')
            }

        }
    }

    return copy
}