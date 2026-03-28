/**
 * createMentionSuggestion.tsx - Factory for mention suggestion config
 *
 * Creates the suggestion object for Tiptap's Mention extension.
 * Handles: positioning, rendering, keyboard events, cleanup.
 */

import { ReactRenderer } from '@tiptap/react'
import { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import MentionList, { MentionItem, MentionListRef } from './MentionList'

type GetItems = (query: string) => MentionItem[] | Promise<MentionItem[]>

interface CreateMentionSuggestionOptions {
    getItems: GetItems
}

/**
 * Creates a suggestion config for the Mention extension.
 *
 * @param getItems - Function that returns filtered items based on query
 */
export function createMentionSuggestion({ getItems }: CreateMentionSuggestionOptions) {
    return {
        items: async ({ query }: { query: string }) => {
            return getItems(query)
        },

        render: () => {
            let component: ReactRenderer<MentionListRef> | null = null
            let popup: HTMLDivElement | null = null

            const updatePosition = (clientRect: () => DOMRect | null) => {
                if (!popup) return
                const rect = clientRect()
                if (!rect) return

                // Virtual element for Floating UI
                const virtualEl = {
                    getBoundingClientRect: () => rect,
                }

                computePosition(virtualEl, popup, {
                    placement: 'top-start',
                    // flip() is used to flip the placement if it doesn't fit on the screen
                    // offset(4) is used to offset the popup by 4px(gap bw popup and cursor)
                    // shift({ padding: 8 }) is used to shift the popup by 8px if it doesn't fit on the screen(viewport)
                    middleware: [offset(4), flip(), shift({ padding: 8 })],
                }).then(({ x, y }) => {
                    if (popup) {
                        popup.style.left = `${x}px`
                        popup.style.top = `${y}px`
                    }
                })
            }

            return {
                onStart: (props: SuggestionProps) => {
                    component = new ReactRenderer(MentionList, {
                        props: {
                            items: props.items,
                            command: props.command,
                        },
                        editor: props.editor,
                    })

                    if (!props.clientRect) return

                    // Create popup container
                    popup = document.createElement('div')
                    popup.style.position = 'fixed'
                    popup.style.zIndex = '50'
                    popup.appendChild(component.element)
                    document.body.appendChild(popup)

                    updatePosition(props.clientRect)
                },

                onUpdate: (props: SuggestionProps) => {
                    component?.updateProps({
                        items: props.items,
                        command: props.command,
                    })

                    if (props.clientRect) {
                        updatePosition(props.clientRect)
                    }
                },

                onKeyDown: (props: SuggestionKeyDownProps) => {
                    if (props.event.key === 'Escape') {
                        popup?.remove()
                        return true
                    }
                    return component?.ref?.onKeyDown(props) ?? false
                },

                onExit: () => {
                    popup?.remove()
                    component?.destroy()
                },
            }
        },
    }
}
