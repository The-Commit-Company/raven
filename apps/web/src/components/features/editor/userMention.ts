import Mention from "@tiptap/extension-mention"
import { ReactRenderer } from "@tiptap/react"
import type { SuggestionOptions } from "@tiptap/suggestion"
import type { UserData } from "@db"
import { usersStore } from "@stores/usersStore"
import { MentionList, type MentionListProps } from "./MentionList"
import { userMentionPluginKey } from "./suggestion"

const MAX_SUGGESTIONS = 8

/** Mention node attrs — `id` is the user name, `label` the display name at insert time. */
type MentionAttrs = { id: string; label: string }

/**
 * Match enabled users by display/user name. You can mention ANYONE on Raven, not
 * just channel members, so this searches the whole user list (usersStore snapshot —
 * synchronous, already in memory). Empty query returns the first N alphabetically;
 * otherwise name-contains, with prefix matches sorted first.
 */
const getUserSuggestions = (query: string): UserData[] => {
    const q = query.toLowerCase().trim()
    const users = [...usersStore.getSnapshot().values()].filter((user) => user.enabled !== 0)
    const matched = q
        ? users.filter((user) => (user.full_name || user.name || "").toLowerCase().includes(q))
        : users
    matched.sort((a, b) => {
        const an = (a.full_name || a.name || "").toLowerCase()
        const bn = (b.full_name || b.name || "").toLowerCase()
        const aStarts = an.startsWith(q) ? 0 : 1
        const bStarts = bn.startsWith(q) ? 0 : 1
        if (aStarts !== bStarts) return aStarts - bStarts
        return an.localeCompare(bn)
    })
    return matched.slice(0, MAX_SUGGESTIONS)
}

/**
 * Mounts the MentionList above the composer and feeds it suggestion lifecycle
 * events. Composer-anchored: the popup is appended to the editor's
 * `[data-raven-editor]` wrapper and positioned with CSS — no positioning library.
 */
const suggestionRender: SuggestionOptions<UserData, MentionAttrs>["render"] = () => {
    // All selection state lives here in the closure (not in the React component or an
    // imperative ref) — so keyboard handling is synchronous and never depends on a
    // ref being attached in time. The component is purely presentational.
    let renderer: ReactRenderer<unknown, MentionListProps> | null = null
    let items: UserData[] = []
    let selectedIndex = 0
    let command: (attrs: MentionAttrs) => void = () => {}

    const choose = (index: number) => {
        const user = items[index]
        if (user) command({ id: user.name, label: user.full_name || user.name })
    }
    const onHover = (index: number) => {
        selectedIndex = index
        update()
    }
    const update = () => renderer?.updateProps({ items, selectedIndex, onSelect: choose, onHover })

    return {
        onStart: (props) => {
            items = props.items
            selectedIndex = 0
            command = props.command
            renderer = new ReactRenderer(MentionList, {
                editor: props.editor,
                props: { items, selectedIndex, onSelect: choose, onHover },
            })
            const anchor = props.editor.view.dom.closest("[data-raven-editor]") ?? document.body
            const element = renderer.element as HTMLElement
            element.className = "absolute left-0 bottom-full z-50 mb-2"
            anchor.appendChild(element)
        },
        onUpdate: (props) => {
            items = props.items
            command = props.command
            if (selectedIndex > items.length - 1) selectedIndex = 0
            update()
        },
        onKeyDown: (props) => {
            if (items.length === 0) return false
            switch (props.event.key) {
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
}

/**
 * @-mention of a user. Renders exactly the markup the backend parses
 * (`extract_mentions` looks for `span[data-type="userMention"]` + `data-id`) and the
 * MessageMention renderer swaps in — so a composed mention round-trips to a stored,
 * notified, interactive mention.
 */
export const UserMention = Mention.extend({ name: "userMention" }).configure({
    HTMLAttributes: { class: "mention" },
    renderText: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
    renderHTML: ({ node }) => [
        "span",
        {
            class: "mention",
            "data-type": "userMention",
            "data-id": node.attrs.id,
            "data-label": node.attrs.label ?? node.attrs.id,
        },
        `@${node.attrs.label ?? node.attrs.id}`,
    ],
    suggestion: {
        char: "@",
        pluginKey: userMentionPluginKey,
        items: ({ query }) => getUserSuggestions(query),
        render: suggestionRender,
        // configure() shallow-replaces the default suggestion, so we provide the
        // insert command ourselves: drop the userMention node + a trailing space.
        command: ({ editor, range, props }) => {
            editor
                .chain()
                .focus()
                .insertContentAt(range, [
                    { type: "userMention", attrs: props },
                    { type: "text", text: " " },
                ])
                .run()
        },
    },
})
