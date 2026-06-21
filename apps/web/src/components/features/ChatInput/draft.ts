/**
 * Per-channel composer drafts, persisted to localStorage so in-progress text
 * survives channel switches and refreshes (v2 parity). Drafts are plain editor HTML
 * keyed by channel; mentions / custom emojis round-trip because their nodes
 * re-parse from the stored markup. Not an atom — drafts don't need cross-component
 * reactivity; the composer seeds once on mount and writes on a debounce.
 */
const key = (channelID: string) => `raven-draft-${channelID}`

/** The saved draft HTML for a channel, or "" if none. */
export const loadDraft = (channelID: string): string => {
    try {
        return localStorage.getItem(key(channelID)) ?? ""
    } catch {
        return ""
    }
}

/** Persist the draft, or clear it when empty. */
export const saveDraft = (channelID: string, html: string): void => {
    try {
        if (html) localStorage.setItem(key(channelID), html)
        else localStorage.removeItem(key(channelID))
    } catch {
        // Ignore quota / private-mode write failures — a lost draft is non-critical.
    }
}
