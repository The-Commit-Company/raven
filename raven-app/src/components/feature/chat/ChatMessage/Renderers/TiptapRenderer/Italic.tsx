import { mergeAttributes } from "@tiptap/react";
import Italic from '@tiptap/extension-italic';
export const CustomItalic = Italic.extend({
    renderHTML({ HTMLAttributes }) {
        return [
            "em",
            mergeAttributes(HTMLAttributes, {
                class: 'rt-Em'
            }), // mergeAttributes is a exported function from @tiptap/core
            0,
        ];
    },
})