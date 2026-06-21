import { atomWithStorage } from "jotai/utils"

export type EnterKeyBehaviour = "new-line" | "send-message"

/**
 * What the Enter key does in the composer. "send-message" (default): Enter sends,
 * Shift+Enter / Cmd+Enter inserts a newline. "new-line": Enter inserts a newline,
 * Cmd/Ctrl+Enter sends. Persisted in localStorage; key/format match v2 so the
 * preference carries over. getOnInit reads the stored value on first render so the
 * editor honours it immediately.
 */
export const EnterKeyBehaviourAtom = atomWithStorage<EnterKeyBehaviour>(
    "raven-enter-key-behaviour",
    "send-message",
    undefined,
    { getOnInit: true },
)

/** Favourite emojis offered as one-tap message reactions. */
export const QuickEmojisAtom = atomWithStorage<string[]>("raven-quick-emojis", ["👍", "✅", "👀", "🎉"])
