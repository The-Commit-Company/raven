import { Message } from "@raven/types/common/Message"
import LinkPreview from "@components/features/chat/ChatMessage/Renderers/LinkPreview"
import MessageTextRenderer from "@components/features/chat-stream/MessageItemElements/MessageTextRenderer"
import * as htmlparser2 from 'htmlparser2';

type MessageContentRendererProps = {
    message: Message,
    showLinkPreview: boolean
}

export const MessageContentRenderer = ({ message, showLinkPreview }: MessageContentRendererProps) => {

    const firstLink = extractFirstLink(message.text)

    if (showLinkPreview && firstLink) {
        return <LinkPreview messageID={message.name} href={firstLink} />
    }
    return (
        <MessageTextRenderer text={message.text} />
    )
}

// in message search for first link and extract href to show link preview
const extractFirstLink = (html: string): string | null => {
    let firstLink: string | null = null

    const parser = new htmlparser2.Parser({
        onopentag(name, attributes) {
            if (!firstLink && name === 'a' && attributes.href) {
                // Ignore mailto: links and ensure it's an http(s) link
                if (!attributes.href.startsWith('mailto:') &&
                    (attributes.href.startsWith('http://') ||
                        attributes.href.startsWith('https://'))) {
                    firstLink = attributes.href
                }
            }
        }
    })

    parser.write(html)
    parser.end()

    return firstLink
}