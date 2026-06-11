import { Navigate } from "react-router-dom"
import { DMChannelHeader } from "@components/features/dm-channel/DMChannelHeader"
import ChannelSettingsDrawer from "@components/features/channel/ChannelSettingsDrawer/ChannelSettingsDrawer"
import { DirectMessagePageSkeleton } from "@components/features/dm-channel/DirectMessagePageSkeleton"
import { ChatContentView } from "@components/features/message/ChatContentView"
import { useUser } from "@hooks/useUser"
import { useAtomValue, useSetAtom } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import _ from "@lib/translate"
import { useChannel } from "@hooks/useChannel"
import { SETTINGS_DRAWER_TYPES } from "@pages/workspace/Channel"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@components/ui/empty"

export default function DirectMessage() {
    const channelID = useCurrentChannelID()
    const { dmChannel } = useChannel(channelID)
    const drawerType = useAtomValue(channelDrawerAtom(channelID))
    const setDrawerType = useSetAtom(channelDrawerAtom(channelID))

    const { data: peerUser, isLoading: isPeerUserLoading } = useUser(dmChannel?.peer_user_id || "")

    const contextDrawer =
        SETTINGS_DRAWER_TYPES.includes(drawerType as (typeof SETTINGS_DRAWER_TYPES)[number]) && peerUser ? (
            <ChannelSettingsDrawer peerUser={peerUser} />
        ) : null

    if (!channelID) {
        return <Navigate to="/dm-channel" replace />
    }

    if (isPeerUserLoading) {
        return <DirectMessagePageSkeleton />
    }

    if (!peerUser) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>{_("Conversation not found")}</EmptyTitle>
                    <EmptyDescription>{_("This direct message may have been removed or you don’t have access.")}</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <DMChannelHeader
                peer={peerUser}
                channelID={channelID}
                onViewProfile={() => setDrawerType('info')}
            />
            <ChatContentView
                channelID={channelID}
                pinnedMessagesString={dmChannel?.pinned_messages_string}
                contextDrawer={contextDrawer}
            />
        </div>
    )
}
