import { useMemo } from "react"
import { ForwardIcon, LucideIcon, PencilIcon, PinIcon } from "lucide-react"
import { Message } from "@raven/types/common/Message"
import ReplyMessage from "./ReplyMessage"
import { MessageImages } from "./MessageImages"
import { MessageFiles } from "./MessageFiles"
import { MessageVideo } from "./MessageVideo"
import { MessageAudio } from "./MessageAudio"
import TiptapRenderer from "./TiptapRenderer"
import SearchTextRenderer from "./SearchTextRenderer"
import { MessageReactionsRow } from "./MessageReactions"
import { getAttachmentKind } from "@utils/attachmentPreview"
import _ from "@lib/translate"

/**
 * Dispatch to TipTap (stored message JSON) vs SearchTextRenderer (FTS plain
 * text with `<mark>` highlights). Backend messages store TipTap JSON as a
 * string (starts with `{`); search rows fed by sqlite FTS arrive as plain text.
 */
export const MessageBody = ({ content }: { content?: string | Record<string, unknown> | null }) => {
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

/** Dispatch a single file-bearing message to the right inline renderer by kind. */
const MessageMedia = ({ message, fileUrl }: { message: Message; fileUrl: string }) => {
    switch (getAttachmentKind(fileUrl)) {
        case "image":
            return <MessageImages messages={[message]} />
        case "video":
            return <MessageVideo messages={[message]} />
        case "audio":
            return <MessageAudio messages={[message]} />
        default:
            // pdf + everything non-previewable → file pill (opens the viewer)
            return <MessageFiles messages={[message]} />
    }
}

export const MessageContent = ({ message }: { message: Message }) => {
    const messageFile = "file" in message ? (message.file as string | undefined) : undefined

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

    // min-w-0: without it this flex column can't shrink below its content, so
    // fixed-width media overflows narrow (mobile) columns and gets clipped
    return (
        <div className="flex-1 min-w-0 space-y-1">
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

            {/* Media dispatch is by file EXTENSION, not message_type (a video
                arrives as message_type "File" but should render as a player) */}
            {messageFile ? (
                <>
                    <MessageMedia message={message} fileUrl={messageFile} />
                    {message.text && <MessageBody content={message.text} />}
                </>
            ) : (
                <MessageBody content={message.content ?? message.text} />
            )}

            <MessageReactionsRow message={message} />
        </div>
    )
}

export default MessageContent
