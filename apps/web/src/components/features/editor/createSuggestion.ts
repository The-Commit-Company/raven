import { ReactRenderer } from "@tiptap/react"
import type { ComponentType, ReactNode } from "react"
import type { PluginKey } from "@tiptap/pm/state"
import type { SuggestionOptions } from "@tiptap/suggestion"
import type { MentionNodeAttrs } from "@tiptap/extension-mention"
import { SuggestionList, type SuggestionListProps } from "./SuggestionList"

/**
 * Node attrs we insert. We always provide both, but the type must stay compatible
 * with Tiptap's MentionNodeAttrs (id/label are `string | null`) so the suggestion
 * config slots into Mention.configure without a contravariance error.
 */
export type MentionAttrs = MentionNodeAttrs

interface MentionSuggestionConfig<T> {
    /** Trigger character (`@`, `#`, …). */
    char: string
    /** Plugin key (registered in suggestion.ts so the Enter-defer sees this popup). */
    pluginKey: PluginKey
    /** The Mention node name to insert (`userMention`, `channelMention`). */
    nodeName: string
    /** Filter the candidate list for the current query (synchronous — from a store). */
    getItems: (query: string) => T[]
    /** Map a chosen item to the node attrs that get stored. */
    toAttrs: (item: T) => MentionAttrs
    /** Row contents for an item. */
    renderItem: (item: T) => ReactNode
    getKey: (item: T) => string
}

/**
 * Builds a Tiptap suggestion config for a mention-style trigger. All selection state
 * lives in this closure (not in the React component or an imperative ref), so
 * keyboard handling is synchronous and reliable. The popup is mounted into the
 * editor's `[data-raven-editor]` wrapper and positioned above the composer with CSS
 * (no positioning library). Escape is handled natively by @tiptap/suggestion.
 */
export function createMentionSuggestion<T>(
    config: MentionSuggestionConfig<T>,
): Omit<SuggestionOptions<T, MentionAttrs>, "editor"> {
    const ListComponent = SuggestionList as ComponentType<SuggestionListProps<T>>

    return {
        char: config.char,
        pluginKey: config.pluginKey,
        items: ({ query }) => config.getItems(query),
        command: ({ editor, range, props }) => {
            editor
                .chain()
                .focus()
                .insertContentAt(range, [
                    // `mentionSuggestionChar` must be the trigger char: Mention's
                    // Backspace handler re-inserts it when you delete the node, and it
                    // defaults to "@" — so without this a #channel becomes "@" on backspace.
                    { type: config.nodeName, attrs: { ...props, mentionSuggestionChar: config.char } },
                    { type: "text", text: " " },
                ])
                .run()
        },
        render: () => {
            let renderer: ReactRenderer<unknown, SuggestionListProps<T>> | null = null
            let items: T[] = []
            let selectedIndex = 0
            let command: (attrs: MentionAttrs) => void = () => {}

            const choose = (index: number) => {
                const item = items[index]
                if (item) command(config.toAttrs(item))
            }
            const onHover = (index: number) => {
                selectedIndex = index
                update()
            }
            const props = () => ({
                items,
                selectedIndex,
                onSelect: choose,
                onHover,
                renderItem: config.renderItem,
                getKey: config.getKey,
            })
            const update = () => renderer?.updateProps(props())

            return {
                onStart: (start) => {
                    items = start.items
                    selectedIndex = 0
                    command = start.command
                    renderer = new ReactRenderer(ListComponent, { editor: start.editor, props: props() })
                    const anchor = start.editor.view.dom.closest("[data-raven-editor]") ?? document.body
                    const element = renderer.element as HTMLElement
                    element.className = "absolute left-0 bottom-full z-50 mb-2"
                    anchor.appendChild(element)
                },
                onUpdate: (next) => {
                    items = next.items
                    command = next.command
                    if (selectedIndex > items.length - 1) selectedIndex = 0
                    update()
                },
                onKeyDown: (key) => {
                    if (items.length === 0) return false
                    switch (key.event.key) {
                        case "ArrowUp":
                            selectedIndex = (selectedIndex + items.length - 1) % items.length
                            update()
                            return true
                        case "ArrowDown":
                            selectedIndex = (selectedIndex + 1) % items.length
                            update()
                            return true
                        case "Enter":
                            choose(selectedIndex)
                            return true
                        default:
                            return false
                    }
                },
                onExit: () => {
                    renderer?.element.remove()
                    renderer?.destroy()
                    renderer = null
                },
            }
        },
    }
}
