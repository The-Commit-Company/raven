import { useMemo } from "react"
import { ForwardIcon, LucideIcon, PencilIcon, PinIcon } from "lucide-react"
import { Message } from "@raven/types/common/Message"
import ReplyMessage from "./ReplyMessage"
import TiptapRenderer from "./TiptapRenderer"
import SearchTextRenderer from "./SearchTextRenderer"
import _ from "@lib/translate"

/**
 * Dispatch to TipTap (stored message JSON) vs SearchTextRenderer (FTS plain
 * text with `<mark>` highlights). Backend messages store TipTap JSON as a
 * string (starts with `{`); search rows fed by sqlite FTS arrive as plain text.
 */
const MessageBody = ({ content }: { content?: string | Record<string, unknown> | null }) => {
    if (content == null) return null
    if (typeof content === 'object') return <TiptapRenderer content={content} />
    const trimmed = content.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return <TiptapRenderer content={trimmed} />
    return <SearchTextRenderer content={trimmed} />
}

const MessageAttributeIndicator = ({ attribute, Icon }: { attribute: string, Icon: LucideIcon }) => (
    <div className="text-ink-gray-4 flex items-center gap-1 py-0.5">
        <Icon className="w-4 h-4 pb-0.5" />
        <span className="text-xs">{attribute}</span>
    </div>
)

export const MessageContent = ({ message }: { message: Message }) => {
    const repliedMessageDetails = useMemo(() => {
        if (message.replied_message_details) {
            try {
                return JSON.parse(message.replied_message_details)
            } catch {
                return null
            }
        }
        return null
    }, [message.replied_message_details])

    return (
        <div className="flex-1 space-y-1">
            {message.is_pinned === 1 && <MessageAttributeIndicator attribute={_("Pinned")} Icon={PinIcon} />}
            {message.is_forwarded === 1 && <MessageAttributeIndicator attribute={_("forwarded")} Icon={ForwardIcon} />}
            {message.is_edited === 1 && <MessageAttributeIndicator attribute={_("edited")} Icon={PencilIcon} />}

            {message.linked_message && repliedMessageDetails && (
                <ReplyMessage
                    repliedMessage={repliedMessageDetails}
                    channelID={message.channel_id}
                    linkedMessageID={message.linked_message}
                />
            )}

            {message.message_type === 'Image' && (
                <>
                    {'file' in message && message.file && (
                        <img
                            src={message.file}
                            alt={message.text || 'image'}
                            className="max-w-xs max-h-64 rounded-md object-cover border border-outline-gray-2/60"
                            loading="lazy"
                        />
                    )}
                    {message.text && <MessageBody content={message.text} />}
                </>
            )}
            {message.message_type === 'File' && (
                <>
                    {'file' in message && message.file && (
                        <a
                            href={message.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-ink-gray-8 underline hover:text-ink-gray-9 break-all"
                        >
                            {message.file.split('/').pop()}
                        </a>
                    )}
                    {message.text && <MessageBody content={message.text} />}
                </>
            )}
            {message.message_type === 'Poll' && (
                <MessageBody content={message.content ?? message.text} />
            )}
            {(message.message_type === 'Text' || message.message_type === 'System' || !message.message_type) && (
                <MessageBody content={message.content ?? message.text} />
            )}

        </div>
    )
}

export default MessageContent
