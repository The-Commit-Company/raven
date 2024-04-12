import TiptapBold from '@tiptap/extension-bold'
import { mergeAttributes } from "@tiptap/react";

export const CustomBold = TiptapBold.extend({
    renderHTML({ HTMLAttributes }) {
        return [
            "strong",
            mergeAttributes(HTMLAttributes, {
                class: 'rt-Strong'
            }), // mergeAttributes is a exported function from @tiptap/core
            0,
        ];
    },
})