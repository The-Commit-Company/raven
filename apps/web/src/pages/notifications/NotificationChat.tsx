import { useEffect } from "react"
import { atom, useAtomValue, useSetAtom } from "jotai"
import ChannelHeader from "@components/features/channel/ChannelHeader/ChannelHeader"
import { DMChannelHeader } from "@components/features/dm-channel/DMChannelHeader"
import { ChatContentView } from "@components/features/message/ChatContentView"
import { messageTargetAtom } from "@utils/channelAtoms"
import { Empty, EmptyHeader, EmptyDescription } from "@components/ui/empty"
import _ from "@lib/translate"
import { Island } from "@components/layout/Island"
import type { UserData } from "@db"

/** Session-scoped selection driving the right pane on the notifications page.
 * Cleared on refresh (in-memory). URL stays at `/notifications`, so this is the
 * single source of truth for which notification is open. */
export type SelectedNotification = {
    channelID: string
    messageID: string
    isDirectMessage: boolean
    peer?: UserData
}
export const selectedNotificationAtom = atom<SelectedNotification | null>(null)

export function NotificationsEmptyState() {
    return (
        <div className="h-full p-0 md:p-1">
            <Island className="h-full">
                <Empty>
                    <EmptyHeader>
                        <EmptyDescription>
                            {_("Select a notification to view the details.")}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </Island>
        </div>
    )
}

export default function NotificationChat() {
    const selected = useAtomValue(selectedNotificationAtom)
    const channelID = selected?.channelID ?? ""
    const setMessageTarget = useSetAtom(messageTargetAtom(channelID))

    // Seed the per-channel target atom so ChatStream/useStreamScroll jumps to
    // the notification's message. ChatStream resets the atom after settling,
    // so a fresh notification click always re-fires this effect.
    useEffect(() => {
        if (!selected) return
        setMessageTarget(selected.messageID)
    }, [selected, setMessageTarget])

    if (!selected) return <NotificationsEmptyState />

    const header = selected.isDirectMessage
        ? selected.peer
            ? <DMChannelHeader peer={selected.peer} channelID={selected.channelID} />
            : null
        : <ChannelHeader channelID={selected.channelID} />

    return (
        <ChatContentView
            channelID={selected.channelID}
            header={header}
        />
    )
}
