import { useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { unreadThreadsStore } from "@stores/threads/unreadStore"
import { ThreadTab, searchViewKey, threadListStore } from "./listStore"
import { selectThreadRows } from "./listSelectors"
import {
    loadInitialThreads,
    loadMoreThreads,
    loadSearchThreads,
    reconcileFirstPage,
    type ThreadCall,
} from "./listLoaders"

type Options = {
    channel?: string
    onlyShowUnread: boolean
    search: string
}

export const useThreadList = (tab: ThreadTab, { channel, onlyShowUnread, search }: Options) => {
    const { call } = useContext(FrappeContext) as FrappeConfig
    const client = call as ThreadCall
    const query = search.trim()
    const isSearch = query.length > 0
    const viewKey = isSearch ? searchViewKey(tab) : tab

    const state = useSyncExternalStore(
        useCallback((onChange) => threadListStore.subscribe(viewKey, onChange), [viewKey]),
        () => threadListStore.getState(viewKey),
    )

    // Live unread set — drives the unread filter, the dot, and the new-thread reconcile.
    // Canonical useSyncExternalStore object pattern: the store hands back a STABLE snapshot
    // reference that changes identity only when membership changes, so React re-renders on
    // every change (including same-size swaps) without a version/useMemo indirection.
    const unreadSet = useSyncExternalStore(
        useCallback((onChange) => unreadThreadsStore.subscribe(onChange), []),
        () => unreadThreadsStore.getSnapshot(),
    )

    // Live tab: fetch the first page on first visit.
    useEffect(() => {
        if (isSearch) return
        loadInitialThreads(client, tab)
    }, [client, tab, isSearch])

    // Search: (re)fetch the snapshot when the query or channel changes.
    useEffect(() => {
        if (!isSearch) return
        loadSearchThreads(client, tab, query, channel)
    }, [client, tab, query, channel, isSearch])

    // New-unread-thread reconcile: if an unread id isn't in the live window, refetch
    // the first page once (the event has no row data). Keyed on the unread snapshot —
    // NOT on `state` — so unrelated live bumps don't re-trigger it, and an id that can
    // never surface (Other-tab membership, beyond first page) won't spin.
    const reconcilingRef = useRef(false)
    const reconciledForRef = useRef<ReadonlySet<string> | null>(null)
    useEffect(() => {
        if (isSearch) return
        if (reconciledForRef.current === unreadSet) return
        const current = threadListStore.getState(tab)
        if (current.status !== "ready") return
        let missing = false
        for (const id of unreadSet) {
            if (!current.byId.has(id)) { missing = true; break }
        }
        if (!missing || reconcilingRef.current) return
        reconcilingRef.current = true
        reconciledForRef.current = unreadSet
        reconcileFirstPage(client, tab).finally(() => {
            reconcilingRef.current = false
        })
    }, [client, tab, isSearch, unreadSet])

    const loadMore = useCallback(() => {
        if (isSearch) return
        loadMoreThreads(client, tab)
    }, [client, tab, isSearch])

    const rows = useMemo(
        () => selectThreadRows(state, { channelFilter: channel, onlyShowUnread, unreadSet }),
        [state, channel, onlyShowUnread, unreadSet],
    )

    return {
        rows,
        isLoading: state.status === "idle" || state.status === "loading",
        error: state.status === "error" ? state.error : null,
        hasMore: state.hasMore,
        loadMore,
    }
}
