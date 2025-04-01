import TiptapLink from '@tiptap/extension-link';
import { mergeAttributes } from "@tiptap/react";

export const CustomLink = TiptapLink.extend({
    renderHTML({ HTMLAttributes }) {
        return [
            "a",
            mergeAttributes(HTMLAttributes, {
                class: 'rt-Text rt-reset rt-Link rt-underline-auto break-all'
            }), // mergeAttributes is a exported function from @tiptap/core
            0,
        ];
    },
}).configure({
    openOnClick: false,
})