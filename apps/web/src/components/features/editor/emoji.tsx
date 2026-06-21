import { Extension } from "@tiptap/core"
import { Suggestion } from "@tiptap/suggestion"
import { SearchIndex } from "emoji-mart"
import { createSuggestionRender } from "./createSuggestion"
import { emojiPluginKey } from "./suggestion"

const MAX_SUGGESTIONS = 8

/** The bits of an emoji-mart search result we use. Custom emojis carry `src` (no native). */
interface EmojiResult {
    id: string
    name: string
    skins: { native?: string; src?: string; shortcodes?: string }[]
}

const nativeOf = (emoji: EmojiResult): string => emoji.skins?.[0]?.native ?? ""
const srcOf = (emoji: EmojiResult): string => emoji.skins?.[0]?.src ?? ""

/**
 * Search emojis via emoji-mart's SearchIndex — the SAME source the app uses for
 * reactions (Apple set + Raven custom emojis, registered in useRegisterCustomEmojis).
 * Keeps anything renderable (a unicode char OR a custom image). Empty query → nothing
 * (":" alone shouldn't pop a list). Async; Tiptap's suggestion awaits it.
 */
const searchEmojis = async (query: string): Promise<EmojiResult[]> => {
    const q = query.trim()
    if (!q) return []
    const results = (await SearchIndex.search(q)) as EmojiResult[] | null
    return (results ?? []).filter((emoji) => nativeOf(emoji) || srcOf(emoji)).slice(0, MAX_SUGGESTIONS)
}

/**
 * Desktop-only `:shortcode:` emoji autocomplete. Standard emojis insert as the native
 * unicode character (plain text → renders natively, no renderer change). Custom emojis
 * have no unicode, so they insert as a CustomEmoji node (a self-contained <img>).
 * Rows preview with <em-emoji> (standard) or the custom image, matching reactions.
 *
 * Added to the editor only on desktop (useRavenEditor): mobile keyboards have their
 * own emoji and a popup on every ":" is noise.
 */
export const EmojiSuggestion = Extension.create({
    name: "emojiSuggestion",

    addProseMirrorPlugins() {
        return [
            Suggestion<EmojiResult, EmojiResult>({
                editor: this.editor,
                char: ":",
                pluginKey: emojiPluginKey,
                items: ({ query }) => searchEmojis(query),
                command: ({ editor, range, props }) => {
                    const native = nativeOf(props)
                    const src = srcOf(props)
                    if (native) {
                        editor.chain().focus().insertContentAt(range, `${native} `).run()
                    } else if (src) {
                        editor
                            .chain()
                            .focus()
                            .insertContentAt(range, [
                                { type: "customEmoji", attrs: { src, alt: `:${props.id}:` } },
                                { type: "text", text: " " },
                            ])
                            .run()
                    }
                },
                render: createSuggestionRender<EmojiResult, EmojiResult>({
                    getKey: (emoji) => emoji.id,
                    toCommandArg: (emoji) => emoji,
                    renderItem: (emoji) =>
                        srcOf(emoji) ? (
                            <>
                                <img src={srcOf(emoji)} alt={emoji.id} loading="lazy" className="h-5 w-5 object-contain" />
                                <span className="truncate text-ink-gray-6">:{emoji.id}:</span>
                            </>
                        ) : (
                            <>
                                <em-emoji native={nativeOf(emoji)} set="apple" size="1.2em" fallback={nativeOf(emoji)} />
                                <span className="truncate text-ink-gray-6">:{emoji.id}:</span>
                            </>
                        ),
                }),
            }),
        ]
    },
})
