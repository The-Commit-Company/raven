import { useIntersectionObserver } from "usehooks-ts"
import { MessageImages } from "./MessageImages"
import { MessageFiles } from "./MessageFiles"
import { MessageBody, MessageContent } from "./MessageContent"
import { MessageRow, MessageSenderLayout } from "./MessageRow"
import type { MessageBatchBlock } from "@stores/messages/types"
import type { Message } from "@raven/types/common/Message"

/**
 * Renders a batch of messages sent together (shared message_batch_id) as one
 * visual block: all-image batches become an album with a shared caption;
 * anything else renders its members stacked under one header.
 *
 * Each member keeps its own `data-message-id` (on its tile or row), so action
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

    const { ref } = useIntersectionObserver({
        onChange: (isIntersecting) => {
            // Read-tracking counts the batch as seen via its newest member
            if (onInView && isIntersecting) onInView(newest)
        },
    })

    const allImages = block.messages.every((message) => message.message_type === "Image")
    const allFiles = block.messages.every((message) => message.message_type === "File")
    /** A batch carries one caption — whichever member has text (the composer sets it on one). */
    const caption = block.messages.find((message) => message.text)?.text

    const content = allImages ? (
        <div className="space-y-1">
            <MessageImages messages={block.messages} />
            {caption && <MessageBody content={caption} />}
        </div>
    ) : allFiles ? (
        <div className="space-y-1">
            <MessageFiles messages={block.messages} />
            {caption && <MessageBody content={caption} />}
        </div>
    ) : (
        // Mixed batch — stack members individually (each row stays addressable)
        <div className="space-y-2">
            {block.messages.map((message) => (
                <div key={message.name} data-message-id={message.name} className="flex">
                    <MessageContent message={message} />
                </div>
            ))}
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
