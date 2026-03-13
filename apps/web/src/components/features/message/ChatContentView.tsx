import { RefObject, useRef } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useInView } from "react-intersection-observer"
import { useAtom, useAtomValue } from "jotai"
import ChatStream from "@components/features/message/ChatStream"
import ChatInput from "@components/features/ChatInput/ChatInput"
import ThreadDrawer from "@components/features/message/ThreadDrawer"
import { PollDrawer } from "@components/features/message/renderers/PollDrawer"
import { MessageListSkeleton } from "@components/features/dm-channel/DirectMessagePageSkeleton"
import { ForwardThreadModal } from "@components/features/message/forward-thread/ForwardThreadModal"
import { pollDrawerAtom, forwardThreadModalAtom } from "@utils/channelAtoms"
import { useScrollToBottom } from "@hooks/useScrollToBottom"
import type { Message } from "@raven/types/common/Message"

/** Same top offset for Channel and DM so the chat stream and scroll area are identical. */
const DEFAULT_CONTENT_PADDING_TOP = "calc(var(--app-header-height, 36px) + 40px)"

export interface ChatContentViewProps {
    /** Channel or DM channel id (useCurrentChannelID is used by ThreadDrawer/ChatInput etc.) */
    channelID: string
    /** Messages for the stream; when undefined/empty and not loading, stream still renders */
    messages?: Message[] | null
    /** When true, show skeleton instead of ChatStream */
    isLoading?: boolean
    /** Rendered when right drawer is not thread and not poll (e.g. channel settings/members or DM drawer). Parent computes based on local state/atoms. */
    contextDrawer: React.ReactNode
    /** Top padding for the content row (defaults to app header + second header height) */
    contentPaddingTop?: string
}

/**
 * Shared content view for Channel and Direct Message pages.
 * Keeps layout, scroll behavior, thread drawer, and poll drawer identical so only sidebar/headers differ.
 */
export function ChatContentView({
    channelID,
    messages,
    isLoading = false,
    contextDrawer,
    contentPaddingTop = DEFAULT_CONTENT_PADDING_TOP,
}: ChatContentViewProps) {
    const chatInputRef = useRef<HTMLFormElement>(null)
    const scrollableRef = useRef<HTMLDivElement>(null)

    const { threadID } = useParams<{ threadID?: string }>()
    const [searchParams] = useSearchParams()
    const isThreadFullscreen = !!threadID && searchParams.get("fullscreen") === "1"
    const pollDrawerData = useAtomValue(pollDrawerAtom(channelID))
    const [, setPollDrawerData] = useAtom(pollDrawerAtom(channelID))
    const forwardThreadData = useAtomValue(forwardThreadModalAtom)
    const [, setForwardThreadData] = useAtom(forwardThreadModalAtom)

    const [startRef] = useInView({})
    const [endRef] = useInView()

    useScrollToBottom({
        stickyRef: chatInputRef as RefObject<HTMLElement>,
        scrollElementRef: scrollableRef as RefObject<HTMLElement>,
    })

    const showDrawer = !!threadID || !!pollDrawerData || !!contextDrawer
    const drawerWidth = threadID ? (isThreadFullscreen ? "w-full" : "w-1/2") : ""

    // Fullscreen thread: only render ThreadDrawer, nothing else
    if (isThreadFullscreen) {
        return (
            <div
                className="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
                style={{ paddingTop: contentPaddingTop }}
            >
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <ThreadDrawer />
                </div>
                {forwardThreadData && (
                    <ForwardThreadModal
                        open={!!forwardThreadData}
                        onOpenChange={(open) => !open && setForwardThreadData(null)}
                        threadData={{
                            threadId: forwardThreadData.threadId,
                            sourceChannelId: forwardThreadData.sourceChannelId,
                            isSourceDm: forwardThreadData.isSourceDm,
                            sourceWorkspace: forwardThreadData.sourceWorkspace,
                            title: forwardThreadData.title,
                            messageCount: forwardThreadData.messageCount,
                            rootMessageSnippet: forwardThreadData.rootMessageSnippet,
                            lastActivity: forwardThreadData.lastActivity,
                            lastMessageOwnerName: forwardThreadData.lastMessageOwnerName,
                        }}
                        onSuccess={() => setForwardThreadData(null)}
                    />
                )}
            </div>
        )
    }

    return (
        <div
            className="flex min-h-0 min-w-0 flex-1 flex-row gap-0 overflow-hidden p-0"
            style={{ paddingTop: contentPaddingTop }}
        >
            {/* Left: chat stream + input */}
            <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col transition-all duration-300">
                <div
                    ref={scrollableRef}
                    className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-auto"
                >
                    <div className="flex min-w-0 w-full flex-1 flex-col lg:mx-auto">
                        <div className="left-0 right-0 -mb-px h-px flex-none" ref={startRef} />
                        {isLoading ? (
                            <MessageListSkeleton />
                        ) : (
                            <ChatStream messages={messages ?? undefined} />
                        )}
                        <div className="left-0 right-0 -mt-px h-px flex-none" ref={endRef} />
                    </div>
                </div>
                <div className="shrink-0">
                    <ChatInput channelID={channelID} ref={chatInputRef} />
                </div>
            </div>

            {/* Right: thread, poll, or context drawer */}
            {!showDrawer ? (
                <div className="w-0" />
            ) : (
                <div
                    className={`flex h-full min-h-0 shrink-0 flex-col border-l bg-background transition-all duration-300 ${drawerWidth}`}
                >
                    {threadID ? (
                        <ThreadDrawer />
                    ) : pollDrawerData ? (
                        <PollDrawer
                            user={pollDrawerData.user}
                            poll={pollDrawerData.poll}
                            currentUserVotes={pollDrawerData.currentUserVotes}
                            onClose={() => setPollDrawerData(null)}
                        />
                    ) : (
                        contextDrawer
                    )}
                </div>
            )}
            {forwardThreadData && (
                <ForwardThreadModal
                    open={!!forwardThreadData}
                    onOpenChange={(open) => !open && setForwardThreadData(null)}
                    threadData={{
                        threadId: forwardThreadData.threadId,
                        sourceChannelId: forwardThreadData.sourceChannelId,
                        isSourceDm: forwardThreadData.isSourceDm,
                        sourceWorkspace: forwardThreadData.sourceWorkspace,
                        title: forwardThreadData.title,
                        messageCount: forwardThreadData.messageCount,
                        rootMessageSnippet: forwardThreadData.rootMessageSnippet,
                        lastActivity: forwardThreadData.lastActivity,
                        lastMessageOwnerName: forwardThreadData.lastMessageOwnerName,
                    }}
                    onSuccess={() => setForwardThreadData(null)}
                />
            )}
        </div>
    )
}
