import { useMemo } from "react"
import { useIntersectionObserver } from "usehooks-ts"
import { MessageImages } from "./MessageImages"
import { MessageFiles } from "./MessageFiles"
import { MessageBody, MessageContent } from "./MessageContent"
import { MessageReactionsRow } from "./MessageReactions"
import { MessageRow, MessageSenderLayout } from "./MessageRow"
import { MessageThreadPill } from "./ThreadMessage"
import { useIsMobile } from "@hooks/use-mobile"
import { messagesToAttachments } from "@utils/attachmentPreview"
import { isThreadParent } from "@utils/messageUtils"
import type { MessageBatchBlock } from "@stores/messages/types"
import type { Message } from "@raven/types/common/Message"

/**
 * Renders a batch of messages sent together (shared message_batch_id) as one
 * visual block: image members become an album, file members a side-by-side
 * pill grid, with one shared caption — a mixed send shows both groups stacked.
 *
 * Each member keeps its own `data-message-id` (on its tile or pill), so action
 * delegation and scroll-to-message still target individual messages.
 */
export const BatchMessageItem = ({
    block,
    onInView,
}: {
    block: MessageBatchBlock
    onInView?: (message: Message) => void
}) => {
    const head = block.messages[0]
    const newest = block.messages[block.messages.length - 1]
    const isMobile = useIsMobile()

    // The selector keeps at most one thread parent in a batch and only the
    // head matters here: when it's a thread, the batch shows the pill +
    // connector, same as a single message (the selector splits 2+ thread batches).
    const showThread = isThreadParent(head)

    const { ref } = useIntersectionObserver({
        onChange: (isIntersecting) => {
            // Read-tracking counts the batch as seen via its newest member
            if (onInView && isIntersecting) onInView(newest)
        },
    })

    // Partition the batch by type: images render as one album, files as one
    // side-by-side pill grid — a mixed send (2 PDFs + 1 photo) shows two
    // coherent groups instead of interleaved one-off rows. Per-member
    // data-message-id lives on each tile/pill, so delegation still targets
    // individual messages.
    const images = block.messages.filter((message) => message.message_type === "Image")
    const files = block.messages.filter((message) => message.message_type === "File")
    // Batches are born from multi-file uploads, so anything else shouldn't
    // occur — but render it addressably rather than dropping it
    const others = block.messages.filter(
        (message) => message.message_type !== "Image" && message.message_type !== "File",
    )

    // One combined set across the whole batch (images + PDFs), shared by both
    // renderers so a mixed batch pages as ONE. Ordered images-then-files to
    // match the visual layout (album above the pill grid) — so the index/counter
    // line up with what the user sees, not raw send order.
    const attachments = useMemo(
        () =>
            messagesToAttachments(
                [
                    ...block.messages.filter((message) => message.message_type === "Image"),
                    ...block.messages.filter((message) => message.message_type === "File"),
                ],
                !isMobile,
            ),
        [block.messages, isMobile],
    )

    /** A batch carries one caption — whichever member has text (the composer sets it on one). */
    const caption = block.messages.find((message) => message.text)?.text

    // Reactions target individual messages, so a batch can carry several rows —
    // one per member that has any (usually at most one)
    const memberReactions = block.messages.map((message) => (
        <MessageReactionsRow key={message.name} message={message} />
    ))

    const content = (
        <div className="space-y-1">
            {images.length > 0 && <MessageImages messages={images} attachments={attachments} />}
            {files.length > 0 && <MessageFiles messages={files} attachments={attachments} />}
            {others.map((message) => (
                <div key={message.name} data-message-id={message.name} className="flex">
                    <MessageContent message={message} />
                </div>
            ))}
            {caption && <MessageBody content={caption} />}
            {memberReactions}
        </div>
    )

    return (
        <MessageRow ref={ref}>
            {showThread && <div className="absolute left-7 w-6 border-l-2 border-b-2 border-outline-gray-1 rounded-bl-2xl z-0 top-[48px] h-[calc(100%-66px)]" />}
            <MessageSenderLayout
                owner={head.owner}
                creation={head.creation}
                isContinuation={block.is_continuation === 1}
            >
                {content}
            </MessageSenderLayout>

            {showThread && <MessageThreadPill threadID={head.name} />}
        </MessageRow>
    )
}
