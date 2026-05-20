import { Navigate } from "react-router-dom"
import { DMChannelHeader } from "@components/features/dm-channel/DMChannelHeader"
import ChannelSettingsDrawer from "@components/features/channel/ChannelSettingsDrawer/ChannelSettingsDrawer"
import { DirectMessagePageSkeleton } from "@components/features/dm-channel/DirectMessagePageSkeleton"
import { ChatContentView } from "@components/features/message/ChatContentView"
import { useGetMessages } from "@hooks/useGetMessages"
import { useUser } from "@hooks/useUser"
import { useAtomValue, useSetAtom } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import _ from "@lib/translate"
import { useChannel } from "@hooks/useChannel"
import { SETTINGS_DRAWER_TYPES } from "@pages/workspace/Channel"

export default function DirectMessage() {
    const channelID = useCurrentChannelID()
    const { dmChannel } = useChannel(channelID)
    const drawerType = useAtomValue(channelDrawerAtom(channelID))
    const setDrawerType = useSetAtom(channelDrawerAtom(channelID))

    const { data: peerUser, isLoading: isPeerUserLoading } = useUser(dmChannel?.peer_user_id || "")
    const { data, isLoading } = useGetMessages(channelID)

    const contextDrawer =
        SETTINGS_DRAWER_TYPES.includes(drawerType as (typeof SETTINGS_DRAWER_TYPES)[number]) && peerUser ? (
            <ChannelSettingsDrawer peerUser={peerUser} />
        ) : null

    if (!channelID) {
        return <Navigate to="/dm-channel" replace />
    }

    if (isPeerUserLoading && !isLoading) {
        return <DirectMessagePageSkeleton />
    }

    if (!peerUser) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-ink-gray-4">
                <p className="text-sm font-medium">{_("Conversation not found")}</p>
                <p className="text-xs">{_("This direct message may have been removed or you don’t have access.")}</p>
            </div>
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
                messages={data?.messages ?? null}
                isLoading={isLoading}
                contextDrawer={contextDrawer}
            />
        </div>
    )
}
