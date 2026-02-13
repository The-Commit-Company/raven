import { Node } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import EmojiList from './EmojiList'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { PluginKey } from '@tiptap/pm/state';
import { SearchIndex, FrequentlyUsed } from 'emoji-mart';

export type EmojiType = {
    shortcodes?: string,
    emoji?: string,
    name?: string,
    id: string,
}

async function search(value: string, maxResults: number = 10): Promise<EmojiType[]> {
    const emojis = await SearchIndex.search(value, { maxResults: maxResults, caller: undefined })

    const results: EmojiType[] = []
    emojis.forEach((emoji: any) => {
        if (emoji && emoji.skins[0].native) {
            results.push({
                shortcodes: emoji.skins[0].shortcodes,
                emoji: emoji.skins[0].native,
                name: emoji.name,
                id: emoji.id,
            })
        }
    })

    return results
}

export function getTopFavoriteEmojis(maxResults: number = 10): EmojiType[] {

    // ID's of emojis

    // @ts-expect-error
    const emojis = FrequentlyUsed.get({ maxFrequentRows: 1, perLine: maxResults })

    const results: EmojiType[] = []

    emojis.forEach((emoji: string) => {
        // @ts-expect-error
        const e = SearchIndex.get(emoji)

        if (e && e.skins[0].native) {
            results.push({
                id: e.id,
                shortcodes: e.skins[0].shortcodes,
                emoji: e.skins[0].native,
                name: e.name,
            })
        }
    })

    return results
}


export const EmojiSuggestion = Node.create({
    name: 'emoji',
    group: 'inline',
    inline: true,
    selectable: false,
    atom: true,

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                char: ':',
                // Allow any character to be a prefix for an emoji
                allowedPrefixes: null,
                pluginKey: new PluginKey('emojiSuggestion'),
                items: (query) => {
                    if (query.query.length !== 0) {
                        return search(query.query)
                    } else {
                        return getTopFavoriteEmojis()
                    }
                },
                render: () => {
                    let component: any;
                    let popup: HTMLDivElement | null = null;

                    const updatePosition = (clientRect: () => DOMRect | null) => {
                        if (!popup) return
                        const rect = clientRect()
                        if (!rect) return

                        const virtualEl = {
                            getBoundingClientRect: () => rect,
                        }

                        computePosition(virtualEl, popup, {
                            placement: 'bottom-start',
                            middleware: [offset(4), flip(), shift({ padding: 8 })],
                        }).then(({ x, y }) => {
                            if (popup) {
                                popup.style.left = `${x}px`
                                popup.style.top = `${y}px`
                            }
                        })
                    }

                    return {
                        onStart: props => {
                            component = new ReactRenderer(EmojiList, {
                                props,
                                editor: props.editor,
                            })

                            if (!props.clientRect) {
                                return
                            }

                            popup = document.createElement('div')
                            popup.style.position = 'fixed'
                            popup.style.zIndex = '50'
                            popup.appendChild(component.element)
                            document.body.appendChild(popup)

                            updatePosition(props.clientRect)
                        },

                        onUpdate(props) {
                            component.updateProps(props)

                            if (props.clientRect) {
                                updatePosition(props.clientRect)
                            }
                        },

                        onKeyDown(props) {
                            if (props.event.key === 'Escape') {
                                popup?.remove()
                                return true
                            }

                            return component.ref?.onKeyDown(props)
                        },

                        onExit() {
                            popup?.remove()
                            component.destroy()
                        },
                    }
                },
                command: ({ editor, range, props }) => {
                    editor.chain().focus().deleteRange(range).insertContent(props.emoji).run()

                    FrequentlyUsed.add(props.id)

                    window.getSelection()?.collapseToEnd()
                },
            }),
        ]
    },

})
