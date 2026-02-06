import { useParams, Navigate } from "react-router-dom"
import { DMChannelHeader } from "@components/features/dm-channel/DMChannelHeader"
import { DMDrawer } from "@components/features/dm-channel/DMDrawer"
import { UserProfileDrawer } from "@components/features/dm-channel/UserProfileDrawer"
import { DirectMessagePageSkeleton, MessageListSkeleton } from "@components/features/dm-channel/DirectMessagePageSkeleton"
import ChatStream from "@components/features/message/ChatStream"
import ChatInput from "@components/features/ChatInput/ChatInput"
import { useGetMessages } from "@hooks/useGetMessages"
import { useScrollToBottom } from "@hooks/useScrollToBottom"
import { useRef, RefObject, useMemo, useState } from "react"
import { useChannelList } from "@hooks/useChannelList"
import { useUser } from "@hooks/useUser"
import type { DMChannelPeer } from "@components/features/dm-channel/DMChannelHeader"
import type { UserFields } from "@raven/types/common/UserFields"

function DMDrawerWrapper({
    channelId,
    profileDrawerUser,
    onCloseProfile,
}: {
    channelId: string
    profileDrawerUser: UserFields | null
    onCloseProfile: () => void
}) {
    if (profileDrawerUser) {
        return (
            <div className="transition-all duration-300 h-full min-h-0 border-l bg-background flex flex-col shrink-0">
                <UserProfileDrawer user={profileDrawerUser} onClose={onCloseProfile} />
            </div>
        )
    }
    return <DMDrawer channelId={channelId} />
}

export default function DirectMessage() {
    const { dm_channel_id } = useParams<{ dm_channel_id: string }>()
    const chatInputRef = useRef<HTMLFormElement>(null)
    const scrollableRef = useRef<HTMLDivElement>(null)

    const channelId = dm_channel_id ?? ""
    const { dm_channels, isLoading: isLoadingChannelList } = useChannelList()

    // Resolve peer from API channel list
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

    useScrollToBottom({
        stickyRef: chatInputRef as RefObject<HTMLElement>,
        scrollElementRef: scrollableRef as RefObject<HTMLElement>,
    })

    if (!channelId) {
        return <Navigate to="/direct-messages" replace />
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
        <div className="flex flex-col h-full min-h-0">
            <DMChannelHeader
                peer={peerForHeader}
                channelId={channelId}
                onViewProfile={() => setProfileDrawerUser(peerForHeader as UserFields)}
            />
            <div
                className="flex flex-1 flex-row gap-0 p-0 overflow-hidden min-h-0"
                style={{ paddingTop: "calc(var(--app-header-height, 36px) + 36px)" }}
            >
                <div className="min-w-0 flex-1 flex flex-col transition-all duration-300 h-full min-h-0">
                    <div ref={scrollableRef} className="relative flex flex-1 flex-col min-h-0 overflow-y-auto">
                        <div className="flex w-full flex-1 flex-col lg:mx-auto">
                            {isLoading ? (
                                <MessageListSkeleton />
                            ) : (
                                <ChatStream messages={data?.messages ?? []} />
                            )}
                        </div>
                    </div>
                    <ChatInput channelID={channelId} ref={chatInputRef} />
                </div>
                <DMDrawerWrapper
                    channelId={channelId}
                    profileDrawerUser={profileDrawerUser}
                    onCloseProfile={() => setProfileDrawerUser(null)}
                />
            </div>
        </div>
    )
}
