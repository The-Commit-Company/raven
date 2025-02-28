import { Node } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import EmojiList from './EmojiList'
import tippy from 'tippy.js';
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
    pluginKey: new PluginKey('emojiSuggestion'),

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
                items: (query) => {
                    if (query.query.length !== 0) {
                        return search(query.query)
                    } else {
                        return getTopFavoriteEmojis()
                    }
                },
                render: () => {
                    let component: any;
                    let popup: any;

                    return {
                        onStart: props => {
                            component = new ReactRenderer(EmojiList, {
                                props,
                                editor: props.editor,
                            })

                            if (!props.clientRect) {
                                return
                            }

                            popup = tippy('body' as any, {
                                getReferenceClientRect: props.clientRect as any,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'bottom-start',
                            })
                        },

                        onUpdate(props) {
                            component.updateProps(props)

                            if (!props.clientRect) {
                                return
                            }

                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect,
                            })
                        },

                        onKeyDown(props) {
                            if (props.event.key === 'Escape') {
                                popup[0].hide()

                                return true
                            }

                            return component.ref?.onKeyDown(props)
                        },

                        onExit() {
                            popup[0].destroy()
                            component.destroy()
                        },
                    }
                },
                command: ({ editor, range, props }) => {
                    // Replace the text from : to with the emoji node
                    editor.chain().focus().deleteRange(range).insertContent(props.emoji).run()

                    FrequentlyUsed.add(props.id)

                    // emojiDatabase.incrementFavoriteEmojiCount(props.unicode)

                    window.getSelection()?.collapseToEnd()
                },
            }),
        ]
    },

})