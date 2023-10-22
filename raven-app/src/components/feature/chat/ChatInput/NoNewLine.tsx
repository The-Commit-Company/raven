import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export const NoNewLine = Extension.create({
    name: 'no_new_line',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('eventHandler'),
                props: {
                    handleKeyDown: (view, event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            return true
                        }
                    }
                    // … and many, many more.
                    // Here is the full list: https://prosemirror.net/docs/ref/#view.EditorProps
                },
            }),
        ]
    },
})