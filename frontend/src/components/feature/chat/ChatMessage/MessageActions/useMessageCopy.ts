import { toast } from 'sonner'
import { Message } from '../../../../../../../types/Messaging/Message'
import turndown from 'turndown'
type Props = {}

export const useMessageCopy = (message?: Message | null, selectedText?: string) => {

    const copy = () => {
        if (!message) return
        if (selectedText) {
            navigator.clipboard.writeText(selectedText)
            toast.success('Text copied to clipboard')
            return
        }
        if (message.message_type === 'Text') {

            // Remove all empty lines
            let text = message.text.replace(/^\s*[\r\n]/gm, "")

            var turndownService = new turndown({
                codeBlockStyle: 'fenced',
            })

            // We want the links to not be converted to markdown links
            // Do not escape the "underscores" in the link text
            turndownService.addRule('links', {
                filter: 'a',
                replacement: function (content, node, options) {
                    return node.textContent ?? content
                }
            })
            var markdown = turndownService.turndown(text)

            if (markdown) {
                navigator.clipboard.writeText(markdown)
                toast.success('Text copied to clipboard')
            } else {
                toast.error('Could not copy text')
            }

        } else if (message.message_type === "Image" || message.message_type === "File") {
            if (message.file.startsWith('http') || message.file.startsWith('https')) {
                navigator.clipboard.writeText(message.file)
            }
            else {
                navigator.clipboard.writeText(window.location.origin + message.file)
            }
            toast.success('Link copied')
        }
    }

    return copy
}