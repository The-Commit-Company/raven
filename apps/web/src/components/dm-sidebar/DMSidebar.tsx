import { useMemo } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Virtuoso } from "react-virtuoso"
import { useLiveQuery } from "dexie-react-hooks"
import { useFrappePostCall, useSWRConfig } from "frappe-react-sdk"
import { toast } from "sonner"
import { Skeleton } from "@components/ui/skeleton"
import { Badge } from "@components/ui/badge"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { useUser } from "@hooks/useUser"
import { db, type UserData } from "@db"
import { cn } from "@lib/utils"
import { formatRelativeDate } from "@lib/date"
import { getMessageTeaser } from "@utils/messageUtils"
import _ from "@lib/translate"
import type { DMChannelListItem } from "@raven/types/common/ChannelListItem"
import { useChannels } from "@hooks/useChannels"
import { useUserCookieData } from "@hooks/useUserCookieData"

export function DMSidebar() {

    const { dm_channels, isLoading } = useChannels()

    const dmPeerIds = useMemo(
        () => new Set(dm_channels.map((d) => d.peer_user_id).filter(Boolean) as string[]),
        [dm_channels]
    )

    return (
        <div className="flex h-full min-h-0">
            {isLoading ? (
                <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
                    <DMSidebarSkeleton />
                </div>
            ) : (
                <Virtuoso
                    className="flex-1 min-h-0"
                    style={{ height: "100%" }}
                    data={dm_channels}
                    defaultItemHeight={64}
                    initialItemCount={Math.min(dm_channels.length, 10)}
                    overscan={200}
                    components={{
                        Footer: () =>
                            dm_channels.length < 5 ? (
                                <ExtraUsersList dmPeerIds={dmPeerIds} />
                            ) : null,
                    }}
                    itemContent={(_index, dm) => (
                        <DMRow
                            key={dm.name}
                            dmChannel={dm}
                        />
                    )}
                />
            )}
        </div>
    )
}


function DMSidebarSkeleton() {
    return (
        <>
            {Array.from({ length: 10 }).map((_, i) => (
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
}

function DMRow({ dmChannel }: DMRowProps) {
    const { data: peerUser } = useUser(dmChannel.peer_user_id)

    const { name: currentUser } = useUserCookieData()

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

    return <NavLink
        to={`/dm-channel/${encodeURIComponent(dmChannel.name)}`}
        className=""
    >
        {({ isActive }) => (
            <DMRowShell
                user={peerUser}
                name={displayName}
                date={date}
                lastMessage={lastMessage}
                unread={unread}
                isActive={isActive}
            />
        )}
    </NavLink>
}


function ExtraUsersList({ dmPeerIds }: { dmPeerIds: Set<string> }) {
    const { name: currentUser } = useUserCookieData()

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
    const { mutate } = useSWRConfig()
    const { call, loading } = useFrappePostCall<{ message: string }>(
        "raven.api.raven_channel.create_direct_message_channel"
    )

    const handleClick = async () => {
        try {
            const res = await call({ user_id: user.name })
            const channelId = res?.message
            if (channelId) {
                mutate("channel_list")
                navigate(`/dm-channel/${encodeURIComponent(channelId)}`)
            }
        } catch {
            toast.error(_("Could not create channel"))
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="flex w-full"
        >
            <DMRowShell
                user={user}
                name={user.full_name || user.name}
                isActive={false}
            />
        </button>
    )
}


interface DMRowShellProps {
    user: UserData
    name: string
    date?: string
    lastMessage?: string
    unread?: number
    isActive: boolean
}

function DMRowShell({
    user,
    name,
    date = "",
    lastMessage = "",
    unread = 0,
    isActive,
}: DMRowShellProps) {


    return (
        <div
            className={cn(
                "flex w-full items-start gap-3 border-b px-3 py-3 md:py-2 text-sm leading-tight last:border-b-0 transition-colors relative text-left",
                "hover:bg-surface-gray-2 hover:text-ink-gray-8 select-none",
                "active:bg-surface-gray-2 active:text-ink-gray-8",
                "disabled:opacity-50 disabled:pointer-events-none",
                isActive && "bg-surface-gray-3 hover:bg-surface-gray-3 text-ink-gray-8"
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
                            unread > 0 ? "font-semibold text-ink-gray-8" : "font-normal"
                        )}
                    >
                        {name}
                    </span>
                    {date && (
                        <span className="text-2xs font-regular text-ink-gray-4 shrink-0">
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
                        <Badge size="sm" variant="subtle" theme="gray">
                            {unread > 9 ? "9+" : unread}
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    )
}
