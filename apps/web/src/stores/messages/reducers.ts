import type { Message } from "@raven/types/common/Message"
import { ChannelMessagesState, MAX_WINDOW_SIZE, MessagesPage, initialChannelState } from "./types"

/**
 * Pure state transitions for a channel's message window.
 *
 * Invariants every reducer maintains:
 * - Synchronous and side-effect free → atomic by construction.
 * - Idempotent: applying the same input twice yields the same state.
 * - Monotonic: a message is never overwritten by a staler version of itself.
 * - Structural sharing: unchanged messages keep their object identity, and a
 *   no-op transition returns the SAME state reference (so subscribers skip work).
 */

/**
 * Orders two messages chronologically, oldest first.
 *
 * Frappe timestamps are fixed-width strings (`YYYY-MM-DD HH:mm:ss.ffffff`),
 * so comparing them as plain strings gives the same result as parsing them
 * into dates — without the cost or timezone pitfalls of `new Date()`.
 * Ties (same creation) are broken by message id so the order is deterministic.
 */
const compareMessages = (a: Message, b: Message): number => {
    if (a.creation !== b.creation) return a.creation < b.creation ? -1 : 1
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
}

/**
 * Rebuilds the sorted id list from scratch.
 *
 * Deliberately not an incremental binary-search insert: a full sort of ≤300
 * messages takes microseconds, and one obviously-correct code path beats two
 * clever ones (insert vs. rebuild) that can drift apart.
 */
const sortIds = (byId: ReadonlyMap<string, Message>): string[] => {
    return [...byId.values()].sort(compareMessages).map((m) => m.name)
}

/**
 * True when `incoming` is the same version or older than what we already hold.
 *
 * This is the monotonicity guard: socket events and fetch responses can arrive
 * out of order, and an older snapshot of a message must never overwrite a newer
 * one. `modified` strings compare lexicographically, same as `creation`.
 * Messages missing `modified` are never considered stale (we can't tell).
 */
const isStale = (existing: Message, incoming: Message): boolean => {
    if (!existing.modified || !incoming.modified) return false
    return incoming.modified <= existing.modified
}

/**
 * Drops messages beyond the window cap from the end given by `trimFrom`,
 * mutating `byId` (safe: callers always pass a fresh copy).
 *
 * The caller decides which end to trim based on the direction of growth:
 * growing downward (older pages) trims the newest end, growing upward
 * (newer pages, live inserts) trims the oldest end. `trimmed` tells the
 * caller to flip the matching `has*Messages` flag, so trimmed history is
 * simply "fetchable again" rather than lost.
 */
const enforceWindowCap = (
    byId: Map<string, Message>,
    order: string[],
    trimFrom: "oldest" | "newest",
): { order: string[]; trimmed: boolean } => {
    if (order.length <= MAX_WINDOW_SIZE) return { order, trimmed: false }
    const excess = order.length - MAX_WINDOW_SIZE
    const dropped = trimFrom === "oldest" ? order.slice(0, excess) : order.slice(-excess)
    for (const id of dropped) byId.delete(id)
    return {
        order: trimFrom === "oldest" ? order.slice(excess) : order.slice(0, -excess),
        trimmed: true,
    }
}

export const markLoading = (state: ChannelMessagesState): ChannelMessagesState => {
    if (state.status === "loading") return state
    return { ...state, status: "loading", error: null }
}

export const markError = (state: ChannelMessagesState, error: string): ChannelMessagesState => {
    return { ...state, status: "error", error, loadingOlder: false, loadingNewer: false }
}

/** Replace the window entirely — initial load, jump-to-message, or resync. */
export const applyInitialPage = (
    _state: ChannelMessagesState,
    page: MessagesPage,
): ChannelMessagesState => {
    const byId = new Map(page.messages.map((m) => [m.name, m]))
    return {
        ...initialChannelState,
        status: "ready",
        byId,
        order: sortIds(byId),
        hasOlderMessages: page.has_old_messages ?? false,
        hasNewerMessages: page.has_new_messages ?? false,
    }
}

/** Merge an older page below the window; trims the newest end if over cap. */
export const applyOlderPage = (
    state: ChannelMessagesState,
    page: MessagesPage,
): ChannelMessagesState => {
    const byId = new Map(state.byId)
    for (const message of page.messages) {
        const existing = byId.get(message.name)
        if (!existing || !isStale(existing, message)) byId.set(message.name, message)
    }
    const { order, trimmed } = enforceWindowCap(byId, sortIds(byId), "newest")
    return {
        ...state,
        byId,
        order,
        hasOlderMessages: page.has_old_messages ?? false,
        hasNewerMessages: trimmed ? true : state.hasNewerMessages,
        loadingOlder: false,
    }
}

/** Merge a newer page above the window; trims the oldest end if over cap. */
export const applyNewerPage = (
    state: ChannelMessagesState,
    page: MessagesPage,
): ChannelMessagesState => {
    const byId = new Map(state.byId)
    for (const message of page.messages) {
        const existing = byId.get(message.name)
        if (!existing || !isStale(existing, message)) byId.set(message.name, message)
    }
    const { order, trimmed } = enforceWindowCap(byId, sortIds(byId), "oldest")
    return {
        ...state,
        byId,
        order,
        hasNewerMessages: page.has_new_messages ?? false,
        hasOlderMessages: trimmed ? true : state.hasOlderMessages,
        loadingNewer: false,
    }
}

/**
 * Insert or update a single message (socket `message_created`, optimistic send ack).
 * New messages are ignored while the window is detached from the live edge —
 * they exist beyond the window and arrive via `applyNewerPage` when the user returns.
 */
export const upsertMessage = (
    state: ChannelMessagesState,
    message: Message,
): ChannelMessagesState => {
    const existing = state.byId.get(message.name)
    if (existing) {
        // Update path: replace the message but keep `order` untouched —
        // creation never changes server-side, so its position is stable.
        if (isStale(existing, message)) return state
        const byId = new Map(state.byId)
        byId.set(message.name, message)
        return { ...state, byId }
    }
    // Insert path: only valid at the live edge. While detached (viewing
    // history), a new message belongs beyond the window — it will arrive
    // via `applyNewerPage` when the user scrolls down or jumps to latest.
    if (state.hasNewerMessages) return state
    const byId = new Map(state.byId)
    byId.set(message.name, message)
    const { order, trimmed } = enforceWindowCap(byId, sortIds(byId), "oldest")
    return {
        ...state,
        byId,
        order,
        hasOlderMessages: trimmed ? true : state.hasOlderMessages,
    }
}

/**
 * Merge a partial update into an existing message (socket `message_edited`,
 * reaction/saved updates). Unknown ids are a no-op — resync covers reordering races.
 */
export const patchMessage = (
    state: ChannelMessagesState,
    messageID: string,
    patch: Partial<Message>,
): ChannelMessagesState => {
    const existing = state.byId.get(messageID)
    if (!existing) return state
    if (patch.modified && existing.modified && patch.modified <= existing.modified) return state
    const byId = new Map(state.byId)
    byId.set(messageID, { ...existing, ...patch } as Message)
    return { ...state, byId }
}

export const removeMessage = (
    state: ChannelMessagesState,
    messageID: string,
): ChannelMessagesState => {
    if (!state.byId.has(messageID)) return state
    const byId = new Map(state.byId)
    byId.delete(messageID)
    return { ...state, byId, order: state.order.filter((id) => id !== messageID) }
}
