import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAtom, useAtomValue } from "jotai"
import { ArrowDown, LoaderCircle } from "lucide-react"
import DateSeparator from "./renderers/DateSeparator"
import SystemMessage from "./renderers/SystemMessage"
import { MessageItem } from "./renderers/MessageItem"
import { BatchMessageItem } from "./renderers/BatchMessageItem"
import { MessageListSkeleton } from "@components/features/dm-channel/DirectMessagePageSkeleton"
import { Button } from "@components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@components/ui/empty"
import { useChannelMessages } from "@stores/messages/useChannelMessages"
import { channelMessagesStore } from "@stores/messages/store"
import { useChannelReadTracker } from "@stores/unread/useChannelReadTracker"
import { useStreamScroll } from "./useStreamScroll"
import { MessageActionMenu } from "./actions/MessageActionMenu"
import { MessageActionDialogs } from "./actions/MessageActionDialogs"
import { messageTargetAtom, messageActionTargetAtom } from "@utils/channelAtoms"
import { cn } from "@lib/utils"
import _ from "@lib/translate"

/** How long a navigated-to message stays highlighted. */
const HIGHLIGHT_DURATION_MS = 4000

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
    const [searchParams, setSearchParams] = useSearchParams()
    // Deep link (?message_id= from notifications, search, shared URLs). Passed to
    // the hook so the channel's FIRST fetch is already centered on the target.
    const deepLinkMessageID = searchParams.get("message_id")

    const {
        blocks,
        isLoading,
        error,
        hasOlderMessages,
        hasNewerMessages,
        loadingOlder,
        loadingNewer,
        loadOlder,
        loadNewer,
        jumpToLatest,
        jumpToMessage,
    } = useChannelMessages(channelID, pinnedMessagesString, deepLinkMessageID)

    const [targetMessageID, setTargetMessageID] = useAtom(messageTargetAtom(channelID))
    const [highlightedID, setHighlightedID] = useState<string | null>(null)
    /** Message the action menu is acting on — highlighted so the user knows the target. */
    const actionTarget = useAtomValue(messageActionTargetAtom)
    /** Tracks the one around-fetch attempted per target, so unknown ids fail gracefully. */
    const attemptedFetchRef = useRef<string | null>(null)

    // Deep links feed the same targeting path as reply clicks.
    useEffect(() => {
        attemptedFetchRef.current = null
        if (deepLinkMessageID) setTargetMessageID(deepLinkMessageID)
    }, [channelID])

    // Out-of-window target: replace the window with a page around it — once.
    // If the fetch lands without the target (deleted/foreign id), give up quietly.
    useEffect(() => {
        if (!targetMessageID) return
        if (channelMessagesStore.getState(channelID).byId.has(targetMessageID)) return
        if (attemptedFetchRef.current === targetMessageID) {
            setTargetMessageID(null)
            return
        }
        attemptedFetchRef.current = targetMessageID
        jumpToMessage(targetMessageID)
    }, [targetMessageID, blocks])

    /** The scroll engine centered the target: highlight it and clean up the URL. */
    const onTargetSettled = useCallback(
        (messageID: string) => {
            setTargetMessageID(null)
            setHighlightedID(messageID)
            if (searchParams.get("message_id") === messageID) {
                const next = new URLSearchParams(searchParams)
                next.delete("message_id")
                setSearchParams(next, { replace: true })
            }
        },
        [searchParams, setSearchParams, setTargetMessageID],
    )

    useEffect(() => {
        if (!highlightedID) return
        const timer = setTimeout(() => setHighlightedID(null), HIGHLIGHT_DURATION_MS)
        return () => clearTimeout(timer)
    }, [highlightedID])

    const { containerRef, onScroll, isAtBottom, hasUnseenMessages, scrollToBottom } = useStreamScroll({
        channelID,
        blocks,
        loadOlder,
        loadNewer,
        hasOlderMessages,
        hasNewerMessages,
        targetMessageID,
        onTargetSettled,
    })

    // Tracks how far the user has read (the newest in-view message) and flushes
    // that watermark to the server (last_visit), which defines unread counts.
    const { onMessageInView } = useChannelReadTracker(channelID, { isAtBottom, hasNewerMessages })

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
            <MessageActionMenu channelID={channelID}>
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
                                ) : block.message_type === "batch" ? (
                                    <div
                                        key={block.name}
                                        data-message-id={block.messages[0].name}
                                        className={cn(
                                            "flex flex-col rounded-md transition-colors duration-700",
                                            block.messages.some((member) => member.name === highlightedID) &&
                                                "bg-surface-amber-2",
                                            block.messages.some((member) => member.name === actionTarget?.name) &&
                                                "bg-surface-gray-2",
                                        )}
                                    >
                                        <BatchMessageItem block={block} onInView={onMessageInView} />
                                    </div>
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
                                        // Deliberately NO content-visibility: placeholder estimates change height
                                        // after paint and break exact scroll compensation on prepend.
                                        className={cn(
                                            "flex flex-col rounded-md transition-colors duration-700",
                                            highlightedID === block.name && "bg-surface-amber-2",
                                            actionTarget?.name === block.name && "bg-surface-gray-2",
                                        )}
                                    >
                                        <MessageItem message={block} onInView={onMessageInView} />
                                    </div>
                                ),
                            )}
                            {/* Same constant-height rule as the top row: while the window is
                                detached, this slot exists whether or not a fetch is running. */}
                            {hasNewerMessages && (
                                <div className="flex h-10 shrink-0 items-center justify-center">
                                    {loadingNewer && (
                                        <LoaderCircle className="h-4 w-4 animate-spin text-ink-gray-5" />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
                </div>
            </MessageActionMenu>
            <MessageActionDialogs />

            {showJumpButton && (
                <div className="absolute bottom-3 right-4 z-10">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onJumpToPresent}
                        className="rounded-full shadow-md bg-surface-base gap-1.5"
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
