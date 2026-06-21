import { useEditor, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import type { MutableRefObject } from "react"
import { useIsMobile } from "@hooks/use-mobile"
import { UserMention } from "./userMention"
import { ChannelMention } from "./channelMention"
import { CustomEmoji } from "./customEmoji"
import { EmojiSuggestion } from "./emoji"
import { isSuggestionPopupOpen } from "./suggestion"

/**
 * The one Tiptap configuration shared by every place we edit a message — the main
 * composer, inline message editing, thread replies. Centralising it here means
 * extensions (mentions, emoji, formatting — added in later layers) and behaviour
 * (Enter to submit, styling) stay identical everywhere instead of being re-declared.
 *
 * The caller owns the submit handler and passes it via a ref: the editor's keydown
 * closure is built once, so reading `submitRef.current` lets it always call the
 * caller's latest handler (which closes over fresh state) without rebuilding the editor.
 */
interface UseRavenEditorOptions {
    /** Invoked on Enter (without Shift). Shift+Enter inserts a newline. */
    submitRef: MutableRefObject<() => void>
    /** Initial HTML — set when editing an existing message; omit for a blank composer. */
    content?: string
    /** Autofocus on mount (e.g. inline edit). Off by default for the composer. */
    autofocus?: boolean
}

/** Shared editor surface styling — the `.tiptap` class is the render/compose source of truth. */
const EDITOR_CLASS = "tiptap min-h-9 max-h-[40vh] overflow-y-auto px-3 py-2 focus:outline-none"

export const useRavenEditor = ({ submitRef, content, autofocus = false }: UseRavenEditorOptions): Editor | null => {
    // Emoji `:` autocomplete is desktop-only — mobile keyboards have their own emoji,
    // and a popup on every ":" is noise. Captured at mount (a breakpoint flip
    // mid-session won't reconfigure the live editor, which is fine).
    const isMobile = useIsMobile()
    const extensions = [StarterKit, UserMention, ChannelMention, CustomEmoji]
    if (!isMobile) extensions.push(EmojiSuggestion)

    return useEditor({
        extensions,
        content,
        autofocus,
        editorProps: {
            attributes: {
                class: EDITOR_CLASS,
            },
            // TODO(mobile): on touch devices Enter should insert a newline and the
            // send button submits — gate this once we wire the mobile composer.
            handleKeyDown: (_view, event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    // A suggestion popup (@mention / #channel / :emoji:) is showing → let it
                    // take Enter to pick the highlighted item instead of submitting. This
                    // editorProps handler runs before the suggestion plugin, so without this
                    // guard it would swallow Enter first.
                    if (isSuggestionPopupOpen()) return false
                    event.preventDefault()
                    submitRef.current()
                    return true
                }
                return false
            },
        },
    })
}
