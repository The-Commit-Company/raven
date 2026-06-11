import { useOutlet } from "react-router-dom"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import ChatStream from "@components/features/message/ChatStream"
import ChatInput from "@components/features/ChatInput/ChatInput"
import { PollDrawer } from "@components/features/message/renderers/PollDrawer"
import { Drawer, DrawerContent, DrawerTitle } from "@components/ui/drawer"
import { pollDrawerAtom, channelDrawerAtom } from "@utils/channelAtoms"
import { useIsMobile } from "@hooks/use-mobile"
import _ from "@lib/translate"

export interface ChatContentViewProps {
    /** Channel or DM channel id (useCurrentChannelID is used by ThreadDrawer/ChatInput etc.) */
    channelID: string
    /** Newline-separated pinned message ids, passed through to the stream. */
    pinnedMessagesString?: string
    /** Rendered when right drawer is not thread and not poll (e.g. channel settings/members or DM drawer). Parent computes based on local state/atoms. */
    contextDrawer: React.ReactNode
}

/**
 * Shared content view for Channel and Direct Message pages.
 * Keeps layout, scroll behavior, thread drawer, and poll drawer identical so only sidebar/headers differ.
 */
export function ChatContentView({
    channelID,
    pinnedMessagesString,
    contextDrawer,
}: ChatContentViewProps) {
    const isMobile = useIsMobile()
    // Child route content (the thread drawer). Threads are routes; everything else in the rail is atom state.
    const threadDrawer = useOutlet()
    const pollDrawerData = useAtomValue(pollDrawerAtom(channelID))
    const [, setPollDrawerData] = useAtom(pollDrawerAtom(channelID))
    const setChannelDrawer = useSetAtom(channelDrawerAtom(channelID))

    // Desktop-only side rail; on mobile, poll/context drawers render as bottom sheets instead
    const showSideRail = !isMobile && (!!threadDrawer || !!pollDrawerData || !!contextDrawer)
    // Right rail width contract: thread takes half the content area, poll/context drawers are a fixed column
    const drawerWidth = threadDrawer ? "w-1/2" : "w-95 max-w-[45%]"

    // On mobile a thread takes over the whole content area
    if (isMobile && threadDrawer) {
        return (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {threadDrawer}
            </div>
        )
    }

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
            {/* Left: chat stream + input */}
            <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
                <ChatStream channelID={channelID} pinnedMessagesString={pinnedMessagesString} />
                <div className="shrink-0">
                    <ChatInput channelID={channelID} />
                </div>
            </div>

            {/* Right (desktop): thread, poll, or context drawer */}
            {showSideRail && (
                <div
                    className={`flex h-full min-h-0 shrink-0 flex-col border-l bg-surface-white ${drawerWidth}`}
                >
                    {threadDrawer ? (
                        threadDrawer
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
        </div>
    )
}
