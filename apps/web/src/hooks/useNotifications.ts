import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { FrappeConfig, FrappeContext, useFrappeEventListener, useFrappeGetCall, useSWRConfig, useSWRInfinite } from "frappe-react-sdk"
import type { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel"
import type { RavenMessage } from "@raven/types/RavenMessaging/RavenMessage"

/**
 * `name` is unique per row (Raven Mention name for mentions, message id for grouped reactions).
 * `reactors` / `reactions` are parallel arrays present only on reaction rows
 */
export interface NotificationObject {
    name: string
    notification_type: "mention" | "reaction"
    is_read: 0 | 1
    message_id: string
    channel_id: string
    owner: string
    reactors?: string[]
    reactions?: string[]
    creation: string
    text: string
    message_type: RavenMessage["message_type"]
    channel_type: RavenChannel["type"]
    channel_name: string
    workspace?: string
    is_thread: 0 | 1
    is_direct_message: 0 | 1
}

/** Items per page. Mirrors backend default `limit`. */
export const PAGE_SIZE = 10

type PageResult = { message: NotificationObject[] }
type CountResult = { message: number }

/** `[endpoint, tabType ("all" | "mention" | "reaction"), startOffset, unreadOnly]`. */
type SWRKey = [string, string, number, boolean]

const UNREAD_COUNT_KEY = "unread_notifications_count"

/**
 * Paginated notifications feed with tab filter (`all` / `mention` / `reaction`) and unread toggle.
 *
 * - Page through notifications via `useSWRInfinite` (page size = {@link PAGE_SIZE}).
 * - Listen to realtime events and revalidate or optimistically update the cache:
 *   `raven_mention`, `raven_reaction_notification`, `all_notifications_read`, `message_notifications_read`.
 * - Expose `markMessageRead` / `markAllRead` (POST + optimistic update).
 *
 * To avoid refetching data already fetched in All tab when the user switches to a filtered tab:
 *
 * 1. While the default view (`tabType === null`) is mounted, every fetched page is snapshotted
 *    into `snapshot`, capturing the user's All-tab fetched items.
 * 2. When the user switches to `mention` or `reaction`, the snapshot is filtered by type. If the
 *    filtered slice already has ≥ {@link PAGE_SIZE} items (or the backend is known exhausted),
 *    cached items render immediately; further pages fetch starting *after* the cached slice (`initialOffsetRef`)
 *    so the backend doesn't re-fetch already fetched items.
 *
 * @param tabType `"mention"` / `"reaction"` filter, or `null` for the merged All tab. Default `null`.
 * @param showUnread When `true`, restrict to unread items. Default `true`.
 * @returns
 *  - `unreadCount` — exact count of unread notifications from `get_unread_notifications_count`.
 *  - `currentData` — items to render (cached seed + fetched, deduped by `name`).
 *  - `isLoading` — SWR first-page load flag.
 *  - `isLoadingMore` — a page index was requested but is still undefined.
 *  - `isReachingEnd` — no more pages available.
 *  - `setSize` — request additional pages.
 *  - `markMessageRead(messageId)` — POST + optimistic update for marking one message's notifications.
 *  - `markAllRead()` — POST + optimistic update for clearing all notifications.
 */
export const useNotifications = (
    tabType: "mention" | "reaction" | null = null,
    showUnread: boolean = true,
) => {
    const { call } = useContext(FrappeContext) as FrappeConfig
    const { mutate: globalMutate } = useSWRConfig()

    /**
     * Unread count for the badge. Fetched separately since it's a small, fast query.
     */
    const { data: unreadCountData, mutate: mutateCount } = useFrappeGetCall<CountResult>(
        "raven.api.notifications.get_unread_notifications_count",
        undefined,
        UNREAD_COUNT_KEY,
        { revalidateOnFocus: true, revalidateIfStale: false }
    )
    const unreadCount = unreadCountData?.message ?? 0

    /**
     * Snapshot of All-tab fetched items. Captured only while `tabType === null`; filtered by
     * type to seed non-default (mentions, reactions) tabs. `mode` records which mode the snapshot
     * was captured in so if snapshot only has unreads and showUnread is toggled, it is invalidated (while the reverse is accepted because unread is a subset of all). 
     * `exhausted` is true when the All-tab's last page was < PAGE_SIZE.
     */
    type SnapshotState = {
        items: NotificationObject[]
        mode: "unread" | "all" | null
        exhausted: boolean
    }
    const [snapshot, setSnapshot] = useState<SnapshotState>({ items: [], mode: null, exhausted: false })
    const modeKey = showUnread ? "unread" : "all"

    /**
     * Cached items available to seed the current non-default tab.
     */
    const cachedItemsForTab = useMemo<NotificationObject[]>(() => {
        if (tabType === null || (snapshot.mode !== modeKey && snapshot.mode !== "all")) return []
        return snapshot.items.filter((n) =>
            n.notification_type === tabType && (!showUnread || !n.is_read)
        )
    }, [tabType, showUnread, modeKey, snapshot])

    /**
     * When `true`, `useSWRInfinite` starts with `initialSize: 0` and the cached items are
     * displayed instead of a fresh fetch. Triggered by a full cached page or by an
     * exhausted backend with some cached items.
     */
    const showCachedAsInitial = cachedItemsForTab.length >= PAGE_SIZE
        || (cachedItemsForTab.length > 0 && snapshot.exhausted && (snapshot.mode === modeKey || snapshot.mode === "all"))

    /**
     * Offset for the first SWR page key. When `showCachedAsInitial` is `true`, this equals the cached slice length
     * so fetched pages start *after* the cached items and the server doesn't return already fetched items.
     */
    const initialOffsetRef = useRef(0)
    /** Last seen `${tabType}|${showUnread}` signature — used to detect tab/mode transitions. */
    const tabKeyRef = useRef("")
    const tabKey = `${tabType ?? "all"}|${showUnread}`
    if (tabKey !== tabKeyRef.current) {
        tabKeyRef.current = tabKey
        initialOffsetRef.current = showCachedAsInitial ? cachedItemsForTab.length : 0
    }

    const { data: pageData, size, setSize, isLoading } = useSWRInfinite<PageResult>(
        (pageIndex: number, previousPageData: PageResult | null): SWRKey | null => {
            if (previousPageData && previousPageData.message.length < PAGE_SIZE) return null
            const start = initialOffsetRef.current + pageIndex * PAGE_SIZE
            return ["raven.api.notifications.get_notifications", tabType ?? "all", start, showUnread]
        },
        ([endpoint, type, start, unread_only]: SWRKey) =>
            call.get<PageResult>(endpoint, {
                ...(type !== "all" && { notification_type: type }),
                limit: PAGE_SIZE,
                start,
                ...(unread_only && { unread_only: 1 }),
            }),
        {
            revalidateOnFocus: false,
            revalidateFirstPage: false,
            initialSize: showCachedAsInitial ? 0 : 1,
        }
    )

    // Capture snapshot.
    useEffect(() => {
        if (tabType !== null || !pageData) return
        const items = pageData.flatMap((p) => p.message)
        const lastPage = pageData[pageData.length - 1]
        setSnapshot({
            items,
            mode: modeKey,
            exhausted: !!lastPage && lastPage.message.length < PAGE_SIZE,
        })
    }, [pageData, tabType, modeKey])

    /** Revalidate every cached notifications page (all tabs/modes) + unread count. */
    const onRefresh = useCallback(() => {
        globalMutate(
            (key) => Array.isArray(key) && key[0] === "raven.api.notifications.get_notifications",
            undefined,
            { revalidate: true }
        )
        mutateCount()
    }, [globalMutate, mutateCount])
    useFrappeEventListener("raven_mention", onRefresh)
    useFrappeEventListener("raven_reaction_notification", onRefresh)

    /**
     * Apply an updater to the snapshot items so `cachedItemsForTab` reflects optimistic
     * read updates performed while NOT on the All tab.
     */
    const updateSeeds = useCallback(
        (updater: (items: NotificationObject[]) => NotificationObject[]) => {
            setSnapshot((prev) => ({ ...prev, items: updater(prev.items) }))
        },
        []
    )

    /**
     * Optimistic update for the `all_notifications_read` event. Flips `is_read` to 1 across every
     * cached notifications page (all tabs/modes) so cross-tab snapshots stay in sync.
     * `currentData` filters out read items when `showUnread` is on, so unread tabs hide them.
     */
    const onAllRead = useCallback(() => {
        globalMutate(
            (key) => Array.isArray(key) && key[0] === "raven.api.notifications.get_notifications",
            (data: PageResult | undefined) => data && {
                message: data.message.map((n) => ({ ...n, is_read: 1 as const })),
            },
            { revalidate: false }
        )
        mutateCount({ message: 0 }, { revalidate: false })
        updateSeeds((items) => items.map((n) => ({ ...n, is_read: 1 as const })))
    }, [globalMutate, mutateCount, updateSeeds])
    useFrappeEventListener("all_notifications_read", onAllRead)

    /**
     * Optimistic update for the `message_notifications_read` event. Flips `is_read` to 1 on every
     * cached notification for `message_id` across all tab/mode SWR keys. `currentData` filters out
     * read items in unread mode, so they disappear there too.
     */
    const onMessageRead = useCallback(({ message_id }: { message_id: string }) => {
        globalMutate(
            (key) => Array.isArray(key) && key[0] === "raven.api.notifications.get_notifications",
            (data: PageResult | undefined) => data && {
                message: data.message.map((n) =>
                    n.message_id === message_id ? { ...n, is_read: 1 as const } : n
                ),
            },
            { revalidate: false }
        )
        mutateCount(
            // This optimistically decrements the unread count by 1, but a message may have more than 1 unread notification.
            // Though this discrepancy will only show on other inactive tabs and will resolve on focus.
            (current: CountResult | undefined) => ({ message: Math.max(0, (current?.message ?? 0) - 1) }),
            { revalidate: false }
        )
        updateSeeds((items) => items.map((n) =>
            n.message_id === message_id ? { ...n, is_read: 1 as const } : n
        ))
    }, [globalMutate, mutateCount, updateSeeds])
    useFrappeEventListener("message_notifications_read", onMessageRead)

    /** Flattened fetched items. */
    const fetchedItems = useMemo(() => pageData?.flatMap((p) => p.message) ?? [], [pageData])
    /**
     * Items to render: cached items followed by fetched items.
     * Cached items go first to preserve the newest-first order inherited from the snapshot.
     */
    const currentData = useMemo<NotificationObject[]>(() => {
        const filteredFetched = fetchedItems.filter((n) =>
            (tabType === null || n.notification_type === tabType) && (!showUnread || !n.is_read)
        )
        const seen = new Set<string>()
        const result: NotificationObject[] = []
        for (const n of [...cachedItemsForTab, ...filteredFetched]) {
            if (!seen.has(n.name)) {
                seen.add(n.name)
                result.push(n)
            }
        }
        return result
    }, [cachedItemsForTab, fetchedItems, tabType, showUnread])

    const isReachingEnd = (snapshot.exhausted && (snapshot.mode === modeKey || snapshot.mode === "all") && tabType !== null)
        ? true
        : pageData && pageData.length > 0
            ? pageData[pageData.length - 1].message.length < PAGE_SIZE
            : false
    const isLoadingMore = isLoading || !!(size > 0 && pageData && typeof pageData[size - 1] === "undefined")

    /**
     * Mark every notification linked to a single message as read.
     * Optimistic update immediately then POST; revalidates on failure to rollback.
     * Backend fires `message_notifications_read` event.
     */
    const markMessageRead = useCallback(
        (messageId: string) => {
            onMessageRead({ message_id: messageId })
            call.post("raven.api.notifications.mark_message_notifications_read", { message_id: messageId })
                .then(() => mutateCount())
                .catch(() => {
                    globalMutate(
                        (key) => Array.isArray(key) && key[0] === "raven.api.notifications.get_notifications",
                        undefined,
                        { revalidate: true }
                    )
                    mutateCount()
                })
        },
        [call, onMessageRead, globalMutate, mutateCount]
    )

    /**
     * Mark every notification (mentions + reactions) for the current user as read.
     * Optimistic update immediately then POST; revalidates on failure to rollback.
     * Backend fires `all_notifications_read` event.
     */
    const markAllRead = useCallback(() => {
        onAllRead()
        call.post("raven.api.notifications.mark_all_notifications_read")
            .then(() => mutateCount())
            .catch(() => {
                globalMutate(
                    (key) => Array.isArray(key) && key[0] === "raven.api.notifications.get_notifications",
                    undefined,
                    { revalidate: true }
                )
                mutateCount()
            })
    }, [call, onAllRead, globalMutate, mutateCount])

    return {
        unreadCount,
        isLoading,
        currentData,
        isReachingEnd,
        isLoadingMore,
        setSize,
        markMessageRead,
        markAllRead,
    }
}