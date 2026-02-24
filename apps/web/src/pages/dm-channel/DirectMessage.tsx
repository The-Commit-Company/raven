import { useParams, Navigate } from "react-router-dom"
import { DMChannelHeader } from "@components/features/dm-channel/DMChannelHeader"
import { DMDrawer } from "@components/features/dm-channel/DMDrawer"
import { UserProfileDrawer } from "@components/features/dm-channel/UserProfileDrawer"
import { DirectMessagePageSkeleton } from "@components/features/dm-channel/DirectMessagePageSkeleton"
import { ChatContentView } from "@components/features/message/ChatContentView"
import { useGetMessages } from "@hooks/useGetMessages"
import { useMemo, useState } from "react"
import { useChannelList } from "@hooks/useChannelList"
import { useUser } from "@hooks/useUser"
import { useAtomValue } from "jotai"
import { dmDrawerAtom } from "@utils/channelAtoms"
import type { DMChannelPeer } from "@components/features/dm-channel/DMChannelHeader"
import type { UserFields } from "@raven/types/common/UserFields"

export default function DirectMessage() {
    const { id } = useParams<{ id: string; threadID?: string }>()
    const channelId = id ?? ""
    const { dm_channels, isLoading: isLoadingChannelList } = useChannelList()
    const dmDrawerType = useAtomValue(dmDrawerAtom(channelId))

    const peer = useMemo((): DMChannelPeer | null => {
        const fromAPI = dm_channels?.find((c) => c.name === channelId)
        if (fromAPI) {
            return {
                name: fromAPI.peer_user_id,
                full_name: fromAPI.peer_user_id,
                type: "User" as const,
            }
        }
        return null
    }, [channelId, dm_channels])

    const [profileDrawerUser, setProfileDrawerUser] = useState<UserFields | null>(null)
    const { data: peerUser } = useUser(peer?.name ?? "")
    const peerForHeader: DMChannelPeer | null = peer
        ? ({
              name: peer.name,
              full_name: peerUser?.full_name ?? peer.full_name ?? peer.name,
              user_image: peerUser?.user_image ?? peer.user_image,
              type: (peerUser?.type ?? peer.type) as "User" | "Bot",
          } as DMChannelPeer)
        : null

    const { data, isLoading } = useGetMessages(channelId)

    const contextDrawer =
        profileDrawerUser ? (
            <div className="flex h-full min-h-0 shrink-0 flex-col border-l bg-background transition-all duration-300">
                <UserProfileDrawer user={profileDrawerUser} onClose={() => setProfileDrawerUser(null)} />
            </div>
        ) : dmDrawerType !== "" ? (
            <DMDrawer channelId={channelId} />
        ) : null

    if (!channelId) {
        return <Navigate to="/dm-channel" replace />
    }

    if (isLoadingChannelList && !peer) {
        return <DirectMessagePageSkeleton />
    }

    if (!peerForHeader) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
                <p className="text-sm font-medium">Conversation not found</p>
                <p className="text-xs">This direct message may have been removed or you don’t have access.</p>
            </div>
        )
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <DMChannelHeader
                peer={peerForHeader}
                channelId={channelId}
                onViewProfile={() => setProfileDrawerUser(peerForHeader as UserFields)}
            />
            <ChatContentView
                channelID={channelId}
                messages={data?.messages ?? null}
                isLoading={isLoading}
                contextDrawer={contextDrawer}
            />
        </div>
    )
}
