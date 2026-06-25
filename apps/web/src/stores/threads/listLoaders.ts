import type { FrappeConfig } from "frappe-react-sdk"
import type { ThreadMessage } from "@/types/ThreadMessage"
import { seedThreadMeta } from "@stores/threads/useThreadMeta"
import { ThreadTab, searchViewKey, threadListStore } from "./listStore"

export type ThreadCall = FrappeConfig["call"]

export const PAGE_SIZE = 10

const endpointFor = (tab: ThreadTab) =>
    tab === "other" ? "raven.api.threads.get_other_threads" : "raven.api.threads.get_all_threads"

const isAi = (tab: ThreadTab): 0 | 1 => (tab === "ai" ? 1 : 0)

type ThreadsResponse = { message: ThreadMessage[] }

/** Seed reply counts so unopened thread pills show the right "N replies" immediately. */
const seedReplyCounts = (rows: ThreadMessage[]) => {
    for (const row of rows) {
        if (typeof row.reply_count === "number") {
            seedThreadMeta(row.name, row.reply_count, row.last_message_timestamp)
        }
    }
}

const fetchPage = (
    call: ThreadCall,
    tab: ThreadTab,
    startAfter: number,
    channel?: string,
    content?: string,
): Promise<ThreadMessage[]> =>
    call
        .get<ThreadsResponse>(endpointFor(tab), {
            is_ai_thread: isAi(tab),
            channel_id: channel && channel !== "*all" ? channel : undefined,
            content: content || undefined,
            start_after: startAfter,
            limit: PAGE_SIZE,
        })
        .then((res) => res.message ?? [])

/** Initial load for a live tab window. No-op if already loaded (warm). */
export const loadInitialThreads = async (call: ThreadCall, tab: ThreadTab) => {
    if (threadListStore.isLoaded(tab)) return
    threadListStore.startLoading(tab)
    try {
        const rows = await fetchPage(call, tab, 0)
        seedReplyCounts(rows)
        threadListStore.setInitialPage(tab, rows, rows.length === PAGE_SIZE)
    } catch (e) {
        threadListStore.failLoading(tab, e instanceof Error ? e.message : String(e))
    }
}

/** Append the next page for a live tab window. */
export const loadMoreThreads = async (call: ThreadCall, tab: ThreadTab) => {
    if (!threadListStore.beginLoadMore(tab)) return
    try {
        const startAfter = threadListStore.getState(tab).order.length
        const rows = await fetchPage(call, tab, startAfter)
        seedReplyCounts(rows)
        threadListStore.appendPage(tab, rows, rows.length === PAGE_SIZE)
    } catch {
        threadListStore.endLoadMore(tab)
    }
}

/**
 * Refetch the first page and merge it into the live tab window. Used when a brand-new
 * unread thread appears (the realtime event carries no row data, only a channel id).
 */
export const reconcileFirstPage = async (call: ThreadCall, tab: ThreadTab) => {
    try {
        const rows = await fetchPage(call, tab, 0)
        seedReplyCounts(rows)
        threadListStore.reconcilePage(tab, rows)
    } catch {
        /* best-effort backstop; ignore */
    }
}

/** Fetch a server-side search snapshot into the detached `<tab>:search` view. */
export const loadSearchThreads = async (
    call: ThreadCall,
    tab: ThreadTab,
    query: string,
    channel?: string,
) => {
    const key = searchViewKey(tab)
    threadListStore.startLoading(key)
    try {
        const rows = await fetchPage(call, tab, 0, channel, query)
        seedReplyCounts(rows)
        threadListStore.setInitialPage(key, rows, false)
    } catch (e) {
        threadListStore.failLoading(key, e instanceof Error ? e.message : String(e))
    }
}
