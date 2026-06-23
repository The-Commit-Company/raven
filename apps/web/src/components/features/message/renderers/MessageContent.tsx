import { useMemo } from "react"
import { useAtomValue } from "jotai"
import { ForwardIcon, LucideIcon, PencilIcon, PinIcon } from "lucide-react"
import { Message } from "@raven/types/common/Message"
import { editingMessageAtom } from "@utils/channelAtoms"
import ReplyMessage from "./ReplyMessage"
import { EditMessageComposer } from "./EditMessageComposer"
import { MessageImages } from "./MessageImages"
import { MessageFiles } from "./MessageFiles"
import { MessageVideo } from "./MessageVideo"
import { MessageAudio } from "./MessageAudio"
import RichTextRenderer from "./RichTextRenderer"
import { PollMessageContent } from "./PollMessageContent"
import SearchTextRenderer from "./SearchTextRenderer"
import { MessageReactionsRow } from "./MessageReactions"
import { getAttachmentKind } from "@utils/attachmentPreview"
import _ from "@lib/translate"

/**
 * Dispatch a message body string to the right renderer:
 *  - `message.text` is Tiptap HTML (begins with a block tag) → RichTextRenderer
 *  - sqlite FTS search snippets are plain text, optionally with `<mark>`
 *    highlights (which would begin with `<mark`) → SearchTextRenderer
 */
export const MessageBody = ({ content }: { content?: string | null }) => {
    if (!content) return null
    const trimmed = content.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('<') && !trimmed.startsWith('<mark')) return <RichTextRenderer html={trimmed} />
    return <SearchTextRenderer content={trimmed} />
}

/**
 * A message's text body that swaps to the inline editor while this message is the
 * channel's edit target (`editingMessageAtom`). Used for a standalone text/caption
 * message and for a batch's caption-bearing member, so editing works the same way
 * everywhere the body is shown.
 */
export const EditableMessageBody = ({ message }: { message: Message }) => {
    const editingID = useAtomValue(editingMessageAtom(message.channel_id))
    if (editingID === message.name) return <EditMessageComposer message={message} />
    return <MessageBody content={message.text} />
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
            {message.message_type === "Poll" ? (
                <PollMessageContent message={message} />
            ) : messageFile ? (
                <>
                    <MessageMedia message={message} fileUrl={messageFile} />
                    {/* Caption (editable inline). Hidden when empty unless being edited. */}
                    {(message.text || undefined) && <EditableMessageBody message={message} />}
                </>
            ) : (
                // Render the HTML body (message.text), NOT message.content — the
                // latter is the backend's derived plain-text (search/teasers).
                <EditableMessageBody message={message} />
            )}

            <MessageReactionsRow message={message} />
        </div>
    )
}

export default MessageContent
