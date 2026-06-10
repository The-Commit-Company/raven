import { RefObject, useRef } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useInView } from "react-intersection-observer"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import ChatStream from "@components/features/message/ChatStream"
import ChatInput from "@components/features/ChatInput/ChatInput"
import ThreadDrawer from "@components/features/message/ThreadDrawer"
import { PollDrawer } from "@components/features/message/renderers/PollDrawer"
import { MessageListSkeleton } from "@components/features/dm-channel/DirectMessagePageSkeleton"
import { ForwardThreadModal } from "@components/features/message/forward-thread/ForwardThreadModal"
import { Drawer, DrawerContent, DrawerTitle } from "@components/ui/drawer"
import { pollDrawerAtom, forwardThreadModalAtom, channelDrawerAtom } from "@utils/channelAtoms"
import { useScrollToBottom } from "@hooks/useScrollToBottom"
import { useIsMobile } from "@hooks/use-mobile"
import _ from "@lib/translate"
import type { Message } from "@raven/types/common/Message"

export interface ChatContentViewProps {
    /** Channel or DM channel id (useCurrentChannelID is used by ThreadDrawer/ChatInput etc.) */
    channelID: string
    /** Messages for the stream; when undefined/empty and not loading, stream still renders */
    messages?: Message[] | null
    /** When true, show skeleton instead of ChatStream */
    isLoading?: boolean
    /** Rendered when right drawer is not thread and not poll (e.g. channel settings/members or DM drawer). Parent computes based on local state/atoms. */
    contextDrawer: React.ReactNode
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
}: ChatContentViewProps) {
    const chatInputRef = useRef<HTMLFormElement>(null)
    const scrollableRef = useRef<HTMLDivElement>(null)

    const isMobile = useIsMobile()
    const { threadID } = useParams<{ threadID?: string }>()
    const [searchParams] = useSearchParams()
    // On mobile a thread always takes over the whole content area
    const isThreadFullscreen = !!threadID && (isMobile || searchParams.get("fullscreen") === "1")
    const pollDrawerData = useAtomValue(pollDrawerAtom(channelID))
    const [, setPollDrawerData] = useAtom(pollDrawerAtom(channelID))
    const setChannelDrawer = useSetAtom(channelDrawerAtom(channelID))
    const forwardThreadData = useAtomValue(forwardThreadModalAtom)
    const [, setForwardThreadData] = useAtom(forwardThreadModalAtom)

    const [startRef] = useInView({})
    const [endRef] = useInView()

    useScrollToBottom({
        stickyRef: chatInputRef as RefObject<HTMLElement>,
        scrollElementRef: scrollableRef as RefObject<HTMLElement>,
    })

    // Desktop-only side rail; on mobile, poll/context drawers render as bottom sheets instead
    const showSideRail = !isMobile && (!!threadID || !!pollDrawerData || !!contextDrawer)
    // Right rail width contract: thread takes half the content area, poll/context drawers are a fixed column
    const drawerWidth = threadID ? "w-1/2" : "w-95 max-w-[45%]"

    // Fullscreen thread: only render ThreadDrawer, nothing else
    if (isThreadFullscreen) {
        return (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
        <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
            {/* Left: chat stream + input */}
            <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
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

            {/* Right (desktop): thread, poll, or context drawer */}
            {showSideRail && (
                <div
                    className={`flex h-full min-h-0 shrink-0 flex-col border-l bg-surface-white ${drawerWidth}`}
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

            {/* Mobile: same drawers, presented as bottom sheets */}
            {isMobile && (
                <>
                    <Drawer open={!!pollDrawerData} onOpenChange={(open) => !open && setPollDrawerData(null)}>
                        <DrawerContent className="h-[85dvh]">
                            <DrawerTitle className="sr-only">{_("Poll")}</DrawerTitle>
                            {pollDrawerData && (
                                <PollDrawer
                                    user={pollDrawerData.user}
                                    poll={pollDrawerData.poll}
                                    currentUserVotes={pollDrawerData.currentUserVotes}
                                    onClose={() => setPollDrawerData(null)}
                                />
                            )}
                        </DrawerContent>
                    </Drawer>
                    <Drawer open={!!contextDrawer && !pollDrawerData} onOpenChange={(open) => !open && setChannelDrawer('')}>
                        <DrawerContent className="h-[85dvh]">
                            <DrawerTitle className="sr-only">{_("Channel details")}</DrawerTitle>
                            {contextDrawer}
                        </DrawerContent>
                    </Drawer>
                </>
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
