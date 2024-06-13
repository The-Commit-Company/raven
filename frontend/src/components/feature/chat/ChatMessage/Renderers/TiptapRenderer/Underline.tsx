import TiptapUnderline from '@tiptap/extension-underline'
import { mergeAttributes } from "@tiptap/react";

export const CustomUnderline = TiptapUnderline.extend({
    renderHTML({ HTMLAttributes }) {
        return [
            "span",
            mergeAttributes(HTMLAttributes, {
                class: 'rt-Text rt-reset rt-Link rt-underline-always text-gray-12',
                'data-accent-color': 'gray',
            }), // mergeAttributes is a exported function from @tiptap/core
            0,
        ];
    },
})