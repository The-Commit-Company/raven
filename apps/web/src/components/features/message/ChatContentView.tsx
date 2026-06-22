import { useOutlet } from "react-router-dom"
import { useAtom } from "jotai"
import ChatStream from "@components/features/message/ChatStream"
import ChatInput from "@components/features/ChatInput/ChatInput"
import ChannelContextDrawer from "@components/features/channel/ChannelContextDrawer"
import { PollDrawer } from "@components/features/message/renderers/PollDrawer"
import { Drawer, DrawerContent, DrawerTitle } from "@components/ui/drawer"
import { Island } from "@components/layout/Island"
import { FileDropZone } from "@components/features/ChatInput/FileDropZone"
import { pollDrawerAtom, channelDrawerAtom } from "@utils/channelAtoms"
import { useIsMobile } from "@hooks/use-mobile"
import _ from "@lib/translate"

export interface ChatContentViewProps {
    /** Channel or DM channel id (useCurrentChannelID is used by ThreadDrawer/ChatInput etc.) */
    channelID: string
    /** The page header (ChannelHeader / DMChannelHeader) — rendered INSIDE the chat island. */
    header?: React.ReactNode
    /** Newline-separated pinned message ids, passed through to the stream. */
    pinnedMessagesString?: string
}

/**
 * Shared content view for Channel and Direct Message pages, and the island
 * orchestrator: the chat (header + stream + input) is one Island, and the
 * thread / poll / context drawer is a SECOND Island beside it, separated by
 * the gray canvas gutter + gap. Mobile collapses to full-bleed — thread takes
 * over, drawers are bottom sheets.
 */
export function ChatContentView({
    channelID,
    header,
    pinnedMessagesString,
}: ChatContentViewProps) {
    const isMobile = useIsMobile()
    // Child route content (the thread drawer). Threads are routes; everything else in the rail is atom state.
    const threadDrawer = useOutlet()
    const [pollDrawerData, setPollDrawerData] = useAtom(pollDrawerAtom(channelID))
    const [channelDrawerType, setChannelDrawer] = useAtom(channelDrawerAtom(channelID))
    const hasContextDrawer = channelDrawerType !== ""

    // Desktop-only side rail; on mobile, poll/context drawers render as bottom sheets instead
    const showSideRail = !isMobile && (!!threadDrawer || !!pollDrawerData || hasContextDrawer)
    // Right island width contract: thread takes half the content area, poll/context drawers are a fixed column
    const drawerWidth = threadDrawer ? "w-1/2" : "w-96 max-w-[45%]"

    // On mobile a thread takes over the whole content area (its own full-bleed surface)
    if (isMobile && threadDrawer) {
        return (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-surface-base">
                {threadDrawer}
            </div>
        )
    }

    return (
        // Canvas gutter: p-1 reveals the gray content-column behind as the
        // frame; gap-1 separates the islands. Full-bleed (p-0) on mobile.
        <div className="flex min-h-0 min-w-0 flex-1 flex-row gap-1 p-0 md:p-1">
            {/* Chat island: header + stream + input */}
            <Island className="flex-1">
                <FileDropZone channelID={channelID}>
                    {header}
                    <ChatStream channelID={channelID} pinnedMessagesString={pinnedMessagesString} />
                    <div className="shrink-0">
                        {/* key by channel: remount per channel so the editor re-autofocuses and
                            draft text doesn't bleed across channels (file/send state already
                            lives in channel-keyed atoms, so a remount is safe). */}
                        <ChatInput key={channelID} channelID={channelID} />
                    </div>
                </FileDropZone>
            </Island>

            {/* Drawer island (desktop): thread, poll, or context drawer */}
            {showSideRail && (
                <Island className={`shrink-0 ${drawerWidth}`}>
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
                        <ChannelContextDrawer />
                    )}
                </Island>
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
                    <Drawer open={hasContextDrawer && !pollDrawerData} onOpenChange={(open) => !open && setChannelDrawer('')}>
                        <DrawerContent className="h-[85dvh]">
                            <DrawerTitle className="sr-only">{_("Channel details")}</DrawerTitle>
                            <ChannelContextDrawer />
                        </DrawerContent>
                    </Drawer>
                </>
            )}
        </div>
    )
}
