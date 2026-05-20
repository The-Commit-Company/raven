import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader } from "@components/ui/sidebar"
import { Skeleton } from "@components/ui/skeleton"
import { DMListItem } from "../common/DMListItem/DMListItem"
import type { DMChannelListItem } from "@raven/types/common/ChannelListItem"
import { useUser } from "@hooks/useUser"
import { formatRelativeDate } from "@lib/date"
import { getMessageTeaser } from "@utils/messageUtils"
import _ from "@lib/translate"


/** Skeleton rows for DM list when channels are loading */
function DMSidebarSkeleton() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-start gap-3 border-b px-4 py-3.5 last:border-b-0"
                >
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex justify-between items-center gap-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-12 shrink-0" />
                        </div>
                        <Skeleton
                            className="h-3"
                            style={{ width: `${55 + (i % 3) * 15}%` }}
                        />
                    </div>
                </div>
            ))}
        </>
    )
}

/** Single DM row when using API data; resolves peer via useUser(peer_user_id) */
function DMChannelRow({
    dmChannel,
    activeDMChannelId,
    onDMClick,
}: {
    dmChannel: DMChannelListItem
    activeDMChannelId: string | null
    onDMClick: (channelId: string) => void
}) {
    const { data: peerUser } = useUser(dmChannel.peer_user_id)

    const date = formatRelativeDate(dmChannel.last_message_timestamp)
    const teaser = getMessageTeaser(dmChannel.last_message_details)
    const unread = typeof dmChannel.last_message_details === "object" && dmChannel.last_message_details?.unread_count != null
        ? Number(dmChannel.last_message_details.unread_count)
        : 0

    if (peerUser)
        return (
            <DMListItem
                user={peerUser}
                date={date}
                teaser={teaser}
                unread={unread}
                isActive={activeDMChannelId === dmChannel.name}
                onClick={(e) => {
                    e.preventDefault()
                    onDMClick(dmChannel.name)
                }}
            />
        )
}

interface DMSidebarProps {
    workspaceName: string
    activeDMChannelId: string | null
    onDMClick: (dmChannelId: string) => void
    /** DM channels from API (e.g. raven.api.raven_channel.get_all_channels) */
    dmChannels?: DMChannelListItem[]
    isLoadingChannels?: boolean
}

export function DMSidebar({
    workspaceName,
    activeDMChannelId,
    onDMClick,
    dmChannels,
    isLoadingChannels = false,
}: DMSidebarProps) {

    return (
        <>
            <SidebarHeader className="h-(--app-header-height) gap-2 px-3 border-b flex items-center group/header">
                <div className="flex items-center justify-between w-full h-full">
                    <div className="text-sm font-medium text-ink-gray-8 truncate">
                        {workspaceName}
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className="p-0">
                    <SidebarGroupContent>
                        {isLoadingChannels ? (
                            <DMSidebarSkeleton />
                        ) : (
                            dmChannels!.map((dm) => (
                                <DMChannelRow
                                    key={dm.name}
                                    dmChannel={dm}
                                    activeDMChannelId={activeDMChannelId}
                                    onDMClick={onDMClick}
                                />
                            ))
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </>
    )
}
