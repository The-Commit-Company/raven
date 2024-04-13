import { Node } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import EmojiList from './EmojiList'
import tippy from 'tippy.js';
import { NativeEmoji } from 'emoji-picker-element/shared';
import { PluginKey } from '@tiptap/pm/state';
import { emojiDatabase } from '@/components/common/EmojiPicker/EmojiPicker';

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
                items: (query) => {
                    if (query.query.length !== 0) {
                        return emojiDatabase.getEmojiBySearchQuery(query.query.toLowerCase()).then((emojis) => {
                            return emojis.slice(0, 10) as NativeEmoji[]
                        });
                    } else {
                        return emojiDatabase.getTopFavoriteEmoji(10) as Promise<NativeEmoji[]>
                    }


                    return []
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
                    editor.chain().focus().deleteRange(range).insertContent(props.unicode).run()

                    emojiDatabase.incrementFavoriteEmojiCount(props.unicode)

                    window.getSelection()?.collapseToEnd()
                },
            }),
        ]
    },

})