import { useCallback, useContext, useEffect, useMemo, useRef } from "react"
import { FrappeConfig, FrappeContext, FrappeError, useSWRInfinite } from "frappe-react-sdk"
import { UserData } from "@db"
import { ThreadPreviewBox } from "./ThreadPreviewBox"
import { ThreadMessage, GetThreadsReturnType } from "../../../types/ThreadMessage"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { useChannels } from "@hooks/useChannels"
import { useUser } from "@hooks/useUser"
import useUnreadThreadsCount from "@hooks/useUnreadThreadsCount"
import { MessageListSkeleton } from "@components/features/dm-channel/DirectMessagePageSkeleton"
import ErrorBanner from "@components/ui/error-banner"
import _ from "@lib/translate"

interface ThreadsListProps {
    users: UserData[]
    threadType?: 'participating' | 'other' | 'ai'
    searchQuery?: string
    channelFilter?: string
    workspaceID?: string
    onlyShowUnread?: boolean
    onThreadClick?: (thread: ThreadMessage) => void
    /** Active thread ID */
    activeThreadID?: string
}

export type ThreadChannelDetails = {
    channelName?: string
    channelIcon?: React.ReactNode
    isDirectMessage?: boolean
    participants: UserData[]
}

const PAGE_SIZE = 10

type SWRKey = [string, {
    is_ai_thread: 0 | 1
    workspace?: string
    content?: string
    channel_id?: string
    startAfter: number
    onlyShowUnread: boolean
}]

function ThreadPreviewBoxWrapper({
    thread,
    users,
    unreadCount,
    onClick,
    isActive
}: {
    thread: ThreadMessage
    users: UserData[]
    unreadCount: number
    onClick?: () => void
    isActive?: boolean
}) {
    const { channels, dm_channels } = useChannels()

    const dmChannel = dm_channels.find((c) => c.name === thread.channel_id)
    const channel = channels.find((c) => c.name === thread.channel_id)
    const { data: peer } = useUser(dmChannel?.peer_user_id ?? '')

    const user = users.find((u) => u.name === thread.owner) || null

    // Format channel details
    const channelDetails: ThreadChannelDetails = useMemo(() => {

        if (thread.is_dm_thread === 1) {
            return {
                channelName: `DM with ${peer?.full_name ?? dmChannel?.peer_user_id ?? _("Unknown")}`,
                channelIcon: undefined,
                isDirectMessage: true,
                participants: peer ? [peer] : []
            }
        } else if (channel) {
            return {
                channelName: channel.channel_name || channel.name,
                channelIcon: <ChannelIcon type={channel.type as 'Public' | 'Private' | 'Open'} className="h-3.5 w-3.5" />,
                isDirectMessage: false,
                participants: thread.participants
                    .map((p) => users.find((u) => u.name === p.user_id))
                    .filter((u): u is UserData => Boolean(u))
            }
        }
        return {
            channelName: undefined,
            channelIcon: undefined,
            isDirectMessage: false,
            participants: []
        }
    }, [channel, dmChannel, users, thread.is_bot_message, thread.bot, peer])

    return (
        <ThreadPreviewBox
            user={user}
            unreadCount={unreadCount}
            thread={thread}
            channelDetails={channelDetails}
            onClick={onClick}
            isActive={isActive}
        />
    )
}

export default function ThreadsList({
    users,
    threadType = 'participating',
    searchQuery,
    channelFilter,
    workspaceID,
    onlyShowUnread = false,
    onThreadClick,
    activeThreadID
}: ThreadsListProps) {
    const { call } = useContext(FrappeContext) as FrappeConfig
    const { data: unreadThreads } = useUnreadThreadsCount(workspaceID)

    const unreadThreadsMap = useMemo(() => {
        return unreadThreads?.message.reduce((acc, t) => {
            acc[t.name] = t.unread_count
            return acc
        }, {} as Record<string, number>) ?? {}
    }, [unreadThreads])

    const endpoint = threadType === 'other'
        ? 'raven.api.threads.get_other_threads'
        : 'raven.api.threads.get_all_threads'

    const isAIThread: 0 | 1 = threadType === 'ai' ? 1 : 0

    const channelParam = channelFilter && channelFilter !== '*all' ? channelFilter : undefined

    const { data, size, isLoading, setSize, error } = useSWRInfinite<GetThreadsReturnType, FrappeError>(
        (pageIndex, previousPageData) => {
            if (previousPageData && !previousPageData.message.length) return null
            const startAfter = pageIndex * PAGE_SIZE
            return [endpoint, {
                is_ai_thread: isAIThread,
                workspace: workspaceID,
                content: searchQuery,
                channel_id: channelParam,
                startAfter,
                onlyShowUnread,
            }] as SWRKey
        },
        (swrKey: SWRKey) => {
            return call.get<GetThreadsReturnType>(swrKey[0], {
                is_ai_thread: swrKey[1].is_ai_thread,
                workspace: swrKey[1].workspace,
                content: swrKey[1].content,
                channel_id: swrKey[1].channel_id,
                start_after: swrKey[1].startAfter,
                limit: PAGE_SIZE,
                only_show_unread: swrKey[1].onlyShowUnread,
            })
        },
        {
            revalidateOnFocus: false,
            revalidateIfStale: true,
        },
    )

    const isEmpty = data?.[0]?.message?.length === 0
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.message?.length < PAGE_SIZE)

    const threads = useMemo(
        () => data?.flatMap((page) => page.message)
            .sort((a, b) => new Date(b.last_message_timestamp).getTime() - new Date(a.last_message_timestamp).getTime()) ?? [],
        [data],
    )

    const observerTarget = useRef<HTMLDivElement>(null)

    const loadMore = useCallback(() => {
        if (!isReachingEnd && !isLoadingMore) {
            setSize(size + 1)
        }
    }, [isReachingEnd, isLoadingMore, setSize, size])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore()
            },
            { threshold: 0.1 },
        )
        if (observerTarget.current) observer.observe(observerTarget.current)
        return () => observer.disconnect()
    }, [loadMore])

    if (error) return <ErrorBanner error={error} />

    if (isLoading && !data) return <MessageListSkeleton />

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-16 pr-6">
                <p className="text-base font-medium mb-2 text-foreground text-center max-w-sm">
                    {onlyShowUnread ? _("You're all caught up") : _("No threads yet")}
                </p>
                <p className="text-xs text-muted-foreground text-center max-w-sm">
                    {onlyShowUnread
                        ? _("There are no unread threads to show. Clear the filter to see all threads.")
                        : threadType === 'ai'
                            ? _("AI threads will appear here when you start conversations with an AI bot.")
                            : _("Create a thread by right-clicking a message and selecting 'Create Thread'.")}
                </p>
            </div>
        )
    }

    return (
        <div className="py-2">
            {threads.map((thread) => (
                <ThreadPreviewBoxWrapper
                    key={thread.name}
                    thread={thread}
                    users={users as UserData[]}
                    unreadCount={unreadThreadsMap[thread.name] ?? 0}
                    onClick={() => onThreadClick?.(thread)}
                    isActive={activeThreadID === thread.name}
                />
            ))}
            <div ref={observerTarget} className="h-4" />
            {isLoadingMore && (
                <div className="text-center py-4 text-xs text-muted-foreground">{_("Loading more threads...")}</div>
            )}
        </div>
    )
}
