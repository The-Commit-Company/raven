import { Message } from '../../../../../../../types/Messaging/Message'
import { useToast } from '@/hooks/useToast'
import turndown from 'turndown'
type Props = {}

export const useMessageCopy = (message: Message) => {
    const { toast } = useToast()

    const copy = () => {
        if (message.message_type === 'Text') {

            // Remove all empty lines
            let text = message.text.replace(/^\s*[\r\n]/gm, "")

            var turndownService = new turndown({
                codeBlockStyle: 'fenced',
            })

            // We want the links to not be converted to markdown links

            turndownService.addRule('links', {
                filter: 'a',
                replacement: function (content, node, options) {
                    return content
                }
            })
            var markdown = turndownService.turndown(text)
            if (markdown) {
                navigator.clipboard.writeText(markdown)
                toast({
                    title: 'Text copied',
                    duration: 800,
                    variant: 'accent'
                })
            } else {
                toast({
                    title: 'Could not copy text',
                    duration: 800,
                    variant: 'destructive'
                })
            }

        } else {
            if (message.file.startsWith('http') || message.file.startsWith('https')) {
                navigator.clipboard.writeText(message.file)
            }
            else {
                navigator.clipboard.writeText(window.location.origin + message.file)
            }
            toast({
                title: 'Link copied',
                duration: 800,
                variant: 'accent'
            })
        }
    }

    return copy
}