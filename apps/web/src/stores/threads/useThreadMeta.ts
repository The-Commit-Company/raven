import { useCallback, useSyncExternalStore } from "react"
import type { FrappeConfig } from "frappe-react-sdk"
import { threadMetaStore } from "@stores/threads/store"
import { seedChannelMembers } from "@hooks/useChannelMembers"
import type { MemberMeta } from "@stores/members/store"

type Caller = FrappeConfig["call"]
type ThreadDetails = { members: Record<string, MemberMeta>; message_count: number }

/** Seed a thread's reply count from get_thread_details (one-time, won't clobber a live value). */
export const seedThreadMeta = (threadID: string, replyCount: number, lastMessageTimestamp?: string) => {
    threadMetaStore.seed(threadID, replyCount, lastMessageTimestamp)
}

/** Threads with a get_thread_details fetch in flight — dedupes concurrent pills / remounts. */
const inFlight = new Set<string>()

/**
 * Fetch get_thread_details ONCE per thread and seed both stores it feeds — members
 * (kept live thereafter by `channel_members_updated`) and the reply count (kept live by
 * `thread_reply`). No-op if already seeded or in flight, so revisiting a channel doesn't
 * refetch every thread pill — the stores already hold the live data. Mirrors
 * `loadChannelMembers`.
 */
export const loadThreadDetails = (call: Caller, threadID: string) => {
    if (!threadID) return
    if (threadMetaStore.getCount(threadID) !== undefined || inFlight.has(threadID)) return
    inFlight.add(threadID)
    call
        .get<{ message: ThreadDetails }>("raven.api.threads.get_thread_details", { thread_id: threadID })
        .then((res) => {
            seedChannelMembers(threadID, res.message.members ?? {})
            seedThreadMeta(threadID, res.message.message_count)
        })
        .finally(() => inFlight.delete(threadID))
}

/**
 * Live reply count for a thread, store-backed. Returns undefined until the thread has been
 * seeded — callers fall back to the value from their own get_thread_details fetch.
 */
export const useThreadReplyCount = (threadID: string): number | undefined => {
    return useSyncExternalStore(
        useCallback((onChange) => threadMetaStore.subscribe(threadID, onChange), [threadID]),
        () => threadMetaStore.getCount(threadID),
    )
}
