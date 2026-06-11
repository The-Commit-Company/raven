import { useRef } from "react"
import { ArrowDown, LoaderCircle } from "lucide-react"
import DateSeparator from "./renderers/DateSeparator"
import SystemMessage from "./renderers/SystemMessage"
import { MessageItem } from "./renderers/MessageItem"
import { MessageListSkeleton } from "@components/features/dm-channel/DirectMessagePageSkeleton"
import { Button } from "@components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@components/ui/empty"
import { useChannelMessages } from "@stores/messages/useChannelMessages"
import { useStreamScroll } from "./useStreamScroll"
import { getDateObject } from "@lib/date"
import _ from "@lib/translate"
import type { Message } from "@raven/types/common/Message"
import dayjs from "dayjs"

export type ChatStreamProps = {
    /** Channel, DM channel, or thread id — threads are channels too. */
    channelID: string
    /** Newline-separated pinned message ids (from the channel doc). */
    pinnedMessagesString?: string
}

/**
 * The message stream: a windowed, bottom-anchored list of messages.
 *
 * Self-contained and reusable — give it a channel id and it fetches, paginates,
 * and scrolls on its own. Pages compose it next to their own headers, inputs,
 * and drawers (channel page, DM page, thread drawer, threads page).
 */
export default function ChatStream({ channelID, pinnedMessagesString }: ChatStreamProps) {
    const {
        blocks,
        isLoading,
        error,
        hasOlderMessages,
        hasNewerMessages,
        loadingOlder,
        loadOlder,
        jumpToLatest,
    } = useChannelMessages(channelID, pinnedMessagesString)

    const { containerRef, onScroll, isAtBottom, hasUnseenMessages, scrollToBottom } =
        useStreamScroll({ channelID, blocks, loadOlder, hasOlderMessages })

    // Tracks the newest message seen in the viewport — feeds last-seen/read
    // receipts when the read-state layer lands.
    const latestSeenTimestamp = useRef<dayjs.Dayjs | null>(null)
    const onMessageInView = (message: Message) => {
        const creation = getDateObject(message.creation)
        if (!latestSeenTimestamp.current || creation.isAfter(latestSeenTimestamp.current)) {
            latestSeenTimestamp.current = creation
        }
    }

    /** When the window is detached from the live edge, "down" means refetching the latest page. */
    const onJumpToPresent = () => {
        if (hasNewerMessages) {
            scrollToBottom()
            jumpToLatest()
        } else {
            scrollToBottom("smooth")
        }
    }

    const showJumpButton = !isLoading && !error && (!isAtBottom || hasNewerMessages)

    return (
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <div
                ref={containerRef}
                onScroll={onScroll}
                className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto [overflow-anchor:none]"
            >
                <div className="flex min-w-0 w-full flex-col px-3 pb-8">
                    {isLoading ? (
                        <MessageListSkeleton />
                    ) : error ? (
                        <StreamError error={error} onRetry={jumpToLatest} />
                    ) : blocks.length === 0 ? (
                        <StreamEmpty />
                    ) : (
                        <>
                            {/* Constant-height row while more history exists: the spinner only ever
                                changes pixels, not geometry. Height changes that move content must
                                land atomically with `blocks` changes for scroll compensation to be exact. */}
                            {hasOlderMessages && (
                                <div className="flex h-10 shrink-0 items-center justify-center">
                                    {loadingOlder && (
                                        <LoaderCircle className="h-4 w-4 animate-spin text-ink-gray-5" />
                                    )}
                                </div>
                            )}
                            {blocks.map((block) =>
                                block.message_type === "date" ? (
                                    <DateSeparator label={block.creation} key={block.name} />
                                ) : block.message_type === "System" ? (
                                    <SystemMessage
                                        message={block.text ?? ""}
                                        time={block.creation}
                                        key={block.name}
                                    />
                                ) : (
                                    <div
                                        key={block.name}
                                        data-message-id={block.name}
                                        // flex: MessageItem's root is an inline span (Radix trigger) — flex blockifies it.
                                        // Deliberately NO content-visibility: placeholder estimates change height
                                        // after paint and break exact scroll compensation on prepend.
                                        className="flex flex-col"
                                    >
                                        <MessageItem message={block} onInView={onMessageInView} />
                                    </div>
                                ),
                            )}
                        </>
                    )}
                </div>
            </div>

            {showJumpButton && (
                <div className="absolute bottom-3 right-4 z-10">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onJumpToPresent}
                        className="rounded-full shadow-md bg-surface-white gap-1.5"
                    >
                        <ArrowDown />
                        {(hasUnseenMessages || hasNewerMessages) && (
                            <span className="text-xs">{_("New messages")}</span>
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}

const StreamEmpty = () => (
    <Empty>
        <EmptyHeader>
            <EmptyTitle>{_("No messages yet")}</EmptyTitle>
            <EmptyDescription>{_("Start the conversation by sending a message.")}</EmptyDescription>
        </EmptyHeader>
    </Empty>
)

const StreamError = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <Empty>
        <EmptyHeader>
            <EmptyTitle>{_("Could not load messages")}</EmptyTitle>
            <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" size="sm" onClick={onRetry}>
            {_("Try again")}
        </Button>
    </Empty>
)
