import type { Message } from "@raven/types/common/Message"
import {
    applyInitialPage,
    applyNewerPage,
    applyOlderPage,
    markError,
    markLoading,
    patchMessage,
    removeMessage,
    removeOptimisticBatch,
    setOptimisticStatus,
    upsertMessage,
    upsertMessages,
} from "./reducers"
import {
    ChannelMessagesState,
    MessagesPage,
    OptimisticMessage,
    initialChannelState,
    isOptimistic,
} from "./types"

/** Channels kept hydrated in memory; least-recently-used unsubscribed channels are evicted. */
const MAX_HYDRATED_CHANNELS = 10

type Listener = () => void

/**
 * The single writer for message state, keyed by channel.
 *
 * Every input — fetched pages, socket events, optimistic sends — goes through
 * these methods, which apply synchronous reducers. Nothing else may mutate
 * message state, which is what makes updates atomic and race-free.
 *
 * The store outlives components: a channel keeps receiving events while the
 * user is elsewhere, so switching back is instant and current.
 */
class ChannelMessagesStore {
    private states = new Map<string, ChannelMessagesState>()
    private listeners = new Map<string, Set<Listener>>()
    /** Subscribers to the SET of hydrated channels (membership), not their contents. */
    private hydratedListeners = new Set<Listener>()
    /** Reference-stable snapshot of hydrated channel IDs; new ref only on membership change. */
    private hydratedIds: readonly string[] = []
    /** Batch ids of sends currently optimistic in the UI — their realtime echoes are skipped until the ack reconciles. */
    private pendingSends = new Set<string>()

    getState(channelID: string): ChannelMessagesState {
        let state = this.states.get(channelID)
        if (!state) {
            state = initialChannelState
            this.states.set(channelID, state)
        }
        return state
    }

    subscribe(channelID: string, listener: Listener): () => void {
        let set = this.listeners.get(channelID)
        if (!set) {
            set = new Set()
            this.listeners.set(channelID, set)
        }
        set.add(listener)
        this.evictStaleChannels()
        // Membership may have changed (this channel added by the getState during
        // the component's render, plus any evictions above). Notify here — a
        // commit-phase entry point — never from getState, which runs during render.
        this.notifyHydrated()
        return () => {
            set.delete(listener)
            if (set.size === 0) this.listeners.delete(channelID)
        }
    }

    /**
     * Subscribe to changes in the SET of hydrated channels (additions / evictions),
     * not their message contents. Used to keep socket room subscriptions in sync
     * with the channels we keep warm in memory. Returns an unsubscribe fn.
     */
    subscribeHydrated(listener: Listener): () => void {
        this.hydratedListeners.add(listener)
        return () => this.hydratedListeners.delete(listener)
    }

    /** Reference-stable list of channels currently hydrated in memory (≤ cap). */
    getHydratedChannelIDs(): readonly string[] {
        return this.hydratedIds
    }

    /** Whether a channel is held in memory — unlike getState, never inserts it. */
    isHydrated(channelID: string): boolean {
        return this.states.has(channelID)
    }

    /** ----- Fetch lifecycle ----- */

    startLoading(channelID: string) {
        this.update(channelID, markLoading(this.getState(channelID)))
    }

    failLoading(channelID: string, error: string) {
        this.update(channelID, markError(this.getState(channelID), error))
    }

    /** Replaces the window — initial load, jump-to-message, or resync. */
    setInitialPage(channelID: string, page: MessagesPage) {
        this.update(channelID, applyInitialPage(this.getState(channelID), page))
    }

    setOlderPage(channelID: string, page: MessagesPage) {
        this.update(channelID, applyOlderPage(this.getState(channelID), page))
    }

    setNewerPage(channelID: string, page: MessagesPage) {
        this.update(channelID, applyNewerPage(this.getState(channelID), page))
    }

    /** Marks a pagination direction in flight; returns false when it should not start. */
    beginPagination(channelID: string, direction: "older" | "newer"): boolean {
        const state = this.getState(channelID)
        if (state.status !== "ready") return false
        if (direction === "older" && (state.loadingOlder || !state.hasOlderMessages)) return false
        if (direction === "newer" && (state.loadingNewer || !state.hasNewerMessages)) return false
        this.update(channelID, {
            ...state,
            loadingOlder: direction === "older" ? true : state.loadingOlder,
            loadingNewer: direction === "newer" ? true : state.loadingNewer,
        })
        return true
    }

    endPagination(channelID: string, direction: "older" | "newer") {
        const state = this.getState(channelID)
        if (direction === "older" && state.loadingOlder) {
            this.update(channelID, { ...state, loadingOlder: false })
        }
        if (direction === "newer" && state.loadingNewer) {
            this.update(channelID, { ...state, loadingNewer: false })
        }
    }

    /** Drops a channel's window so the next visit refetches (jump-to-latest, eviction). */
    reset(channelID: string) {
        this.update(channelID, initialChannelState)
    }

    /** ----- Optimistic send lifecycle ----- */

    /** Show a send immediately. `batchId` (= client_id) ties the placeholders together and gates the echoes. */
    addOptimisticMessages(channelID: string, batchId: string, messages: OptimisticMessage[]) {
        this.pendingSends.add(batchId)
        this.update(channelID, upsertMessages(this.getState(channelID), messages))
    }

    /** The send's ack landed: drop the placeholders and insert the real messages it returned. */
    resolveOptimisticSend(channelID: string, batchId: string, realMessages: Message[]) {
        this.pendingSends.delete(batchId)
        let next = removeOptimisticBatch(this.getState(channelID), batchId)
        next = upsertMessages(next, realMessages)
        this.update(channelID, next)
    }

    /** The send failed: leave the placeholders in place, flagged failed, for retry/discard. */
    failOptimisticSend(channelID: string, batchId: string) {
        this.pendingSends.delete(batchId)
        this.update(channelID, setOptimisticStatus(this.getState(channelID), batchId, "failed"))
    }

    /** Retry a failed send: flip its placeholders back to sending and re-arm the echo skip. */
    retryOptimisticSend(channelID: string, batchId: string) {
        this.pendingSends.add(batchId)
        this.update(channelID, setOptimisticStatus(this.getState(channelID), batchId, "sending"))
    }

    /** Discard a failed send's placeholders. */
    discardOptimisticSend(channelID: string, batchId: string) {
        this.pendingSends.delete(batchId)
        this.update(channelID, removeOptimisticBatch(this.getState(channelID), batchId))
    }

    /** The optimistic placeholders of a send, in display order — used to rebuild the payload on retry. */
    getOptimisticMessages(channelID: string, batchId: string): Message[] {
        const state = this.getState(channelID)
        const out: Message[] = []
        for (const id of state.order) {
            const message = state.byId.get(id)
            if (message && isOptimistic(message) && message.message_batch_id === batchId) out.push(message)
        }
        return out
    }

    /** True while a send's optimistic placeholders are live — its realtime echoes should be skipped. */
    isPendingSend(batchId: string): boolean {
        return this.pendingSends.has(batchId)
    }

    /** ----- Event-shaped entry points (socket dispatcher and optimistic sends call these) ----- */

    messageCreated(channelID: string, message: Message) {
        this.update(channelID, upsertMessage(this.getState(channelID), message))
    }

    messageEdited(channelID: string, messageID: string, patch: Partial<Message>) {
        this.update(channelID, patchMessage(this.getState(channelID), messageID, patch))
    }

    messageDeleted(channelID: string, messageID: string) {
        this.update(channelID, removeMessage(this.getState(channelID), messageID))
    }

    /** Reactions are server-authoritative: always replace the blob, never merge. */
    reactionsUpdated(channelID: string, messageID: string, reactions: string) {
        const state = this.getState(channelID)
        this.update(channelID, patchMessage(state, messageID, { message_reactions: reactions }))
    }

    savedUpdated(channelID: string, messageID: string, likedBy: string) {
        const state = this.getState(channelID)
        this.update(channelID, patchMessage(state, messageID, { _liked_by: likedBy }))
    }

    /** ----- Internals ----- */

    /**
     * Commits a state transition and notifies that channel's subscribers.
     *
     * Reducers return the SAME reference when a transition is a no-op
     * (duplicate event, stale version, unknown id), so the identity check
     * here means no-ops produce zero notifications and zero re-renders.
     */
    private update(channelID: string, next: ChannelMessagesState) {
        const current = this.states.get(channelID)
        if (current === next) return
        this.states.set(channelID, next)
        this.listeners.get(channelID)?.forEach((listener) => listener())
    }

    /**
     * Caps how many channels stay hydrated. Map iteration is insertion-ordered,
     * so the oldest-touched channels are checked first; channels with active
     * subscribers are never evicted. Evicted channels just refetch on revisit.
     */
    private evictStaleChannels() {
        if (this.states.size <= MAX_HYDRATED_CHANNELS) return
        for (const channelID of this.states.keys()) {
            if (this.states.size <= MAX_HYDRATED_CHANNELS) break
            if (this.listeners.has(channelID)) continue
            this.states.delete(channelID)
        }
    }

    /**
     * Recompute the hydrated-channel snapshot and notify its subscribers — but
     * only when membership actually changed, so the snapshot keeps a stable
     * reference between changes (useSyncExternalStore depends on that).
     */
    private notifyHydrated() {
        const next = [...this.states.keys()]
        const prev = this.hydratedIds
        if (next.length === prev.length && next.every((id, i) => id === prev[i])) return
        this.hydratedIds = next
        this.hydratedListeners.forEach((listener) => listener())
    }
}

export const channelMessagesStore = new ChannelMessagesStore()
