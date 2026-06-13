import { useMemo } from "react"
import { useIntersectionObserver } from "usehooks-ts"
import { MessageImages } from "./MessageImages"
import { MessageFiles } from "./MessageFiles"
import { MessageBody, MessageContent } from "./MessageContent"
import { MessageReactionsRow } from "./MessageReactions"
import { MessageRow, MessageSenderLayout } from "./MessageRow"
import { useIsMobile } from "@hooks/use-mobile"
import { messagesToAttachments } from "@utils/attachmentPreview"
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

    // One combined, send-ordered set across the whole batch (images + PDFs),
    // shared by both renderers so a mixed batch pages as ONE — arrow from the
    // last image straight into the first PDF.
    const attachments = useMemo(() => messagesToAttachments(block.messages, !isMobile), [block.messages, isMobile])

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
            <MessageSenderLayout
                owner={head.owner}
                creation={head.creation}
                isContinuation={block.is_continuation === 1}
            >
                {content}
            </MessageSenderLayout>
        </MessageRow>
    )
}
