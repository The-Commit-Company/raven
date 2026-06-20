import { PluginKey, type EditorState } from "@tiptap/pm/state"

/**
 * Plugin keys for the editor's "type a trigger → popup" extensions (mentions now;
 * #channels and :emoji: later). Kept together so the editor's Enter handler can ask
 * "is any suggestion popup open?" — when one is, Enter should pick the highlighted
 * item, not submit the message. Add new suggestion keys to SUGGESTION_KEYS.
 */
export const userMentionPluginKey = new PluginKey("userMentionSuggestion")

const SUGGESTION_KEYS = [userMentionPluginKey]

/** True while any suggestion popup is open (its plugin state is active). */
export const isAnySuggestionActive = (state: EditorState): boolean =>
    SUGGESTION_KEYS.some((key) => Boolean(key.getState(state)?.active))
