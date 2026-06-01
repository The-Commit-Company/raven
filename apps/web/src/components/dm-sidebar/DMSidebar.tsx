import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Virtuoso } from "react-virtuoso"
import { useLiveQuery } from "dexie-react-hooks"
import { useFrappeAuth, useFrappePostCall, useSWRConfig } from "frappe-react-sdk"
import { toast } from "sonner"

import { SidebarGroup, useSidebar } from "@components/ui/sidebar"
import { Skeleton } from "@components/ui/skeleton"
import { Badge } from "@components/ui/badge"
import { UserAvatar } from "@components/features/message/UserAvatar"
import ErrorBanner from "@components/ui/error-banner"

import { useUser } from "@hooks/useUser"
import { db, type UserData } from "@db"
import { cn } from "@lib/utils"
import { formatRelativeDate } from "@lib/date"
import { getMessageTeaser } from "@utils/messageUtils"
import _ from "@lib/translate"
import type { DMChannelListItem } from "@raven/types/common/ChannelListItem"


interface DMSidebarProps {
    activeDMChannelId: string | null
    onDMClick: (dmChannelId: string) => void
    dmChannels?: DMChannelListItem[]
    isLoadingChannels?: boolean
}

export function DMSidebar({
    activeDMChannelId,
    onDMClick,
    dmChannels = [],
    isLoadingChannels = false,
}: DMSidebarProps) {
    const dmPeerIds = useMemo(
        () => new Set(dmChannels.map((d) => d.peer_user_id).filter(Boolean) as string[]),
        [dmChannels]
    )

    return (
        <SidebarGroup className="p-0 flex-1 min-h-0">
            {isLoadingChannels ? (
                <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
                    <DMSidebarSkeleton />
                </div>
            ) : (
                <Virtuoso
                    className="flex-1 min-h-0"
                    style={{ height: "100%" }}
                    data={dmChannels}
                    defaultItemHeight={64}
                    initialItemCount={Math.min(dmChannels.length, 10)}
                    overscan={200}
                    components={{
                        Footer: () =>
                            dmChannels.length < 5 ? (
                                <ExtraUsersList dmPeerIds={dmPeerIds} />
                            ) : null,
                    }}
                    itemContent={(_index, dm) => (
                        <DMRow
                            key={dm.name}
                            dmChannel={dm}
                            isActive={activeDMChannelId === dm.name}
                            onClick={() => onDMClick(dm.name)}
                        />
                    )}
                />
            )}
        </SidebarGroup>
    )
}


function DMSidebarSkeleton() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-start gap-3 border-b px-3 py-3 md:py-2 last:border-b-0"
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


interface DMRowProps {
    dmChannel: DMChannelListItem
    isActive: boolean
    onClick: () => void
}

function DMRow({ dmChannel, isActive, onClick }: DMRowProps) {
    const { data: peerUser } = useUser(dmChannel.peer_user_id)
    const { setOpenMobile, isMobile } = useSidebar()
    const { currentUser } = useFrappeAuth()

    if (!peerUser || peerUser.enabled === 0) return null

    const unread =
        typeof dmChannel.last_message_details === "object" &&
            dmChannel.last_message_details?.unread_count != null
            ? Number(dmChannel.last_message_details.unread_count)
            : 0

    const isSelf = peerUser.name === currentUser
    const baseName = peerUser.full_name || peerUser.name
    const displayName = isSelf ? _("{0} (You)", [baseName]) : baseName
    const date = formatRelativeDate(dmChannel.last_message_timestamp)
    const lastMessage = getMessageTeaser(dmChannel.last_message_details)

    const handleClick = () => {
        onClick()
        if (isMobile) setOpenMobile(false)
    }

    return (
        <DMRowShell
            user={peerUser}
            name={displayName}
            date={date}
            lastMessage={lastMessage}
            unread={unread}
            isActive={isActive}
            onClick={handleClick}
        />
    )
}


function ExtraUsersList({ dmPeerIds }: { dmPeerIds: Set<string> }) {
    const { currentUser } = useFrappeAuth()

    const users =
        useLiveQuery(
            () =>
                db.users
                    .where("enabled")
                    .equals(1)
                    .and((u) => u.name !== currentUser)
                    .and((u) => u.type !== "Bot")
                    .and((u) => !dmPeerIds.has(u.name))
                    .limit(5)
                    .toArray(),
            [currentUser, dmPeerIds]
        ) ?? []

    if (users.length === 0) return null

    return (
        <>
            {users.map((user) => (
                <ExtraUserRow key={user.name} user={user} />
            ))}
        </>
    )
}


function ExtraUserRow({ user }: { user: UserData }) {
    const navigate = useNavigate()
    const { setOpenMobile, isMobile } = useSidebar()
    const { mutate } = useSWRConfig()
    const { call, loading, error } = useFrappePostCall<{ message: string }>(
        "raven.api.raven_channel.create_direct_message_channel"
    )

    const handleClick = async () => {
        try {
            const res = await call({ user_id: user.name })
            const channelId = res?.message
            if (channelId) {
                mutate("channel_list")
                navigate(`/dm-channel/${encodeURIComponent(channelId)}`)
                if (isMobile) setOpenMobile(false)
            }
        } catch {
            toast.error(_("Could not create channel"))
        }
    }

    if (error) {
        return <ErrorBanner error={error} />
    }

    return (
        <DMRowShell
            user={user}
            name={user.full_name || user.name}
            date=""
            lastMessage=""
            unread={0}
            isActive={false}
            disabled={loading}
            onClick={handleClick}
        />
    )
}


interface DMRowShellProps {
    user: UserData
    name: string
    date: string
    lastMessage: string
    unread: number
    isActive: boolean
    disabled?: boolean
    onClick: () => void
}

function DMRowShell({
    user,
    name,
    date,
    lastMessage,
    unread,
    isActive,
    disabled = false,
    onClick,
}: DMRowShellProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex w-full items-start gap-3 border-b px-3 py-3 md:py-2 text-sm leading-tight last:border-b-0 transition-colors relative text-left",
                "hover:bg-surface-gray-3 hover:text-ink-gray-8",
                "active:bg-surface-gray-3 active:text-ink-gray-8",
                "disabled:opacity-50 disabled:pointer-events-none",
                isActive && "bg-surface-gray-3/90 text-ink-gray-8"
            )}
        >
            <div className="shrink-0 self-center">
                <UserAvatar
                    user={user}
                    size="md"
                    showStatusIndicator
                    showBotIndicator
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2 mb-0.5">
                    <span
                        className={cn(
                            "truncate text-base md:text-sm",
                            unread > 0 ? "font-semibold text-ink-gray-8" : "font-medium"
                        )}
                    >
                        {name}
                    </span>
                    {date && (
                        <span className="text-2xs font-light text-ink-gray-4/90 shrink-0">
                            {date}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "line-clamp-1 text-sm md:text-xs flex-1 min-w-0",
                            unread > 0
                                ? "font-medium text-ink-gray-8/90"
                                : "text-ink-gray-4/80"
                        )}
                    >
                        {lastMessage}
                    </div>
                    {unread > 0 && (
                        <Badge size="sm" variant="solid" theme="gray">
                            {unread > 9 ? "9+" : unread}
                        </Badge>
                    )}
                </div>
            </div>
        </button>
    )
}
