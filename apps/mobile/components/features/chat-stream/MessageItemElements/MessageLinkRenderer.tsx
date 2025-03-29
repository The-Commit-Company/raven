import { Message } from "@raven/types/common/Message"
import LinkPreview from "@components/features/chat/ChatMessage/Renderers/LinkPreview"
import * as htmlparser2 from 'htmlparser2';
import { ALLOWED_FILE_EXTENSIONS, getFileExtension } from "@raven/lib/utils/operations";

type MessageLinkRendererProps = {
    message: Message
}


export const MessageLinkRenderer = ({ message }: MessageLinkRendererProps) => {

    const firstLink = extractFirstLink(message.text)

    if (firstLink) {
        return <LinkPreview messageID={message.name} href={firstLink} />
    }
    return null
}

// in message search for first link and extract href to show link preview
const extractFirstLink = (html: string): string | null => {
    let firstLink: string | null = null

    const parser = new htmlparser2.Parser({
        onopentag(name, attributes) {
            if (!firstLink && name === 'a' && attributes.href) {
                // Ignore mailto: links and ensure it's an http(s) link and does not end with a file extension
                const fileExtension = getFileExtension(attributes.href)
                // if file-extension is one of the allowed file extensions, ignore the link
                if (fileExtension && ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
                    return
                }

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