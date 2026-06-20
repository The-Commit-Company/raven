import { useEditor, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import type { MutableRefObject } from "react"
import { UserMention } from "./userMention"
import { isAnySuggestionActive } from "./suggestion"

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
    return useEditor({
        extensions: [StarterKit, UserMention],
        content,
        autofocus,
        editorProps: {
            attributes: {
                class: EDITOR_CLASS,
            },
            // TODO(mobile): on touch devices Enter should insert a newline and the
            // send button submits — gate this once we wire the mobile composer.
            handleKeyDown: (view, event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    // A suggestion popup (e.g. @mention) is open → let it take Enter to
                    // pick the highlighted item instead of submitting the message. This
                    // editorProps handler runs before the suggestion plugin, so without
                    // this guard it would swallow Enter first.
                    if (isAnySuggestionActive(view.state)) return false
                    event.preventDefault()
                    submitRef.current()
                    return true
                }
                return false
            },
        },
    })
}
