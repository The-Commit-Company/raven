import * as Clipboard from 'expo-clipboard'
import { Message } from '@raven/types/common/Message'

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
                // toast.success('Text copied to clipboard')
                onSuccess()
            } else {
                // toast.error('Could not copy text')
            }

        }
    }

    return copy
}
