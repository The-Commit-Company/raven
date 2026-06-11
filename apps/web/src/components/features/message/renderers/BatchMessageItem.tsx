import { useMemo } from "react"
import { useIntersectionObserver } from "usehooks-ts"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { useUser } from "@hooks/useUser"
import { getDateObject } from "@lib/date"
import _ from "@lib/translate"
import { UserAvatar } from "../UserAvatar"
import { MessageImages } from "./MessageImages"
import { MessageBody, MessageContent } from "./MessageContent"
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
    const { data: user } = useUser(head.owner)
    const displayName = user?.full_name || user?.name || head.owner || _("User")

    const { shortTime, longTime } = useMemo(() => {
        try {
            const dateObject = getDateObject(head.creation)
            return {
                shortTime: dateObject.format("hh:mm A"),
                longTime: dateObject.format("Do MMMM YYYY, hh:mm A"),
            }
        } catch {
            return { shortTime: head.creation, longTime: head.creation }
        }
    }, [head.creation])

    const { ref } = useIntersectionObserver({
        onChange: (isIntersecting) => {
            // Read-tracking counts the batch as seen via its newest member
            if (onInView && isIntersecting) onInView(newest)
        },
    })

    const allImages = block.messages.every((message) => message.message_type === "Image")
    /** A batch carries one caption — whichever member has text (the composer sets it on one). */
    const caption = block.messages.find((message) => message.text)?.text

    const content = allImages ? (
        <div className="space-y-1">
            <MessageImages messages={block.messages} />
            {caption && <MessageBody content={caption} />}
        </div>
    ) : (
        <div className="space-y-2">
            {block.messages.map((message) => (
                <div key={message.name} data-message-id={message.name} className="flex">
                    <MessageContent message={message} />
                </div>
            ))}
        </div>
    )

    return (
        <div
            ref={ref}
            className="group/message-item w-full overflow-hidden relative hover:bg-surface-gray-1 py-2 rounded-md px-3.5 transition-all duration-200"
        >
            {block.is_continuation === 1 ? (
                <div className="flex items-start gap-3">
                    <div className="w-8 min-w-8" />
                    <div className="flex-1 min-w-0">{content}</div>
                </div>
            ) : (
                <div className="flex items-start gap-3">
                    {user ? (
                        <UserAvatar user={user} size="md" />
                    ) : (
                        <div className="h-8 w-8 shrink-0 rounded-full bg-surface-gray-2 flex items-center justify-center text-xs font-medium text-ink-gray-4">
                            {displayName.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                            <span className="font-medium text-sm">{displayName}</span>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger>
                                    <span className="text-xs font-regular text-ink-gray-4/90 tabular-nums">
                                        {shortTime}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>{longTime}</TooltipContent>
                            </Tooltip>
                        </div>
                        {content}
                    </div>
                </div>
            )}
        </div>
    )
}
