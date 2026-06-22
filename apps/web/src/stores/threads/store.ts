type Listener = () => void

type Entry = {
    /** Live reply count for the thread (get_thread_details.message_count, then patched by thread_reply). */
    replyCount: number
    /** Timestamp of the latest reply — kept for the threads list / unread badge (piece C). */
    lastMessageTimestamp?: string
}

/**
 * Per-thread metadata that changes FREQUENTLY — currently just the reply count.
 *
 * Deliberately separate from `channelMembersStore`: a thread's members change rarely
 * (refetched on `channel_members_updated`), but replies stream in. The `thread_reply`
 * event already carries `number_of_replies`, so a new reply patches the count straight
 * from the event — no refetch, and no conflating the hot count with the cold member map
 * in one cache entry.
 *
 * LAZY + patch-only-loaded: an entry exists only once a pill has been viewed and seeded
 * it from get_thread_details. `thread_reply` for a never-opened thread is a no-op here
 * (it still feeds the unread badge separately); the count is fetched fresh when that
 * thread is finally viewed.
 */
class ThreadMetaStore {
    private entries = new Map<string, Entry>()
    private listeners = new Map<string, Set<Listener>>()

    /** Current reply count, or undefined if this thread hasn't been seeded yet. */
    getCount(threadID: string): number | undefined {
        return this.entries.get(threadID)?.replyCount
    }

    subscribe(threadID: string, listener: Listener): () => void {
        let set = this.listeners.get(threadID)
        if (!set) {
            set = new Set()
            this.listeners.set(threadID, set)
        }
        set.add(listener)
        return () => {
            set.delete(listener)
            if (set.size === 0) this.listeners.delete(threadID)
        }
    }

    /**
     * One-time seed from get_thread_details (the lazy pill fetch). Won't clobber an entry
     * that's already tracked — a live `thread_reply` patch is newer than a fetch that may
     * have been in flight when the reply arrived.
     */
    seed(threadID: string, replyCount: number, lastMessageTimestamp?: string) {
        if (this.entries.has(threadID)) return
        this.entries.set(threadID, { replyCount, lastMessageTimestamp })
        this.notify(threadID)
    }

    /**
     * Apply a `thread_reply` event. Patches ONLY threads already tracked here — we never
     * build state for threads the user hasn't opened (those are handled by the unread badge).
     */
    patch(threadID: string, replyCount: number, lastMessageTimestamp?: string) {
        const prev = this.entries.get(threadID)
        if (!prev) return
        if (prev.replyCount === replyCount && prev.lastMessageTimestamp === lastMessageTimestamp) return
        this.entries.set(threadID, {
            replyCount,
            lastMessageTimestamp: lastMessageTimestamp ?? prev.lastMessageTimestamp,
        })
        this.notify(threadID)
    }

    private notify(threadID: string) {
        this.listeners.get(threadID)?.forEach((listener) => listener())
    }
}

export const threadMetaStore = new ThreadMetaStore()
