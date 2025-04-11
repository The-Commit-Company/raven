"use dom"

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";

import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Link from "@tiptap/extension-link";
import Code from "@tiptap/extension-code";
import History from "@tiptap/extension-history";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Italic from '@tiptap/extension-italic'
import Bold from '@tiptap/extension-bold'
import Strike from '@tiptap/extension-strike'
import ListItem from "@tiptap/extension-list-item"
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import TextFormattingMenu from "./TextFormattingMenu"

import "./tiptap.css";

interface TiptapProps {
    content: string;
    dom: import('expo/dom').DOMProps;
    onUpdate: (html: string) => void;
    isDarkMode: boolean;
}

const TiptapEditor = ({
    content,
    dom,
    onUpdate,
    isDarkMode,
}: TiptapProps) => {

    // Initialize editor with content; ensure content is never undefined.
    const editor = useEditor({
        extensions: [
            Document,
            History,
            Paragraph,
            Text,
            Code,
            Underline,
            Italic,
            Bold,
            Strike,
            Highlight.configure({
                multicolor: true,
                HTMLAttributes: {
                    class: 'bg-[var(--yellow-6)] dark:bg-[var(--yellow-11)] px-2 py-1'
                }
            }),
            Link.extend({ inclusive: false }).configure({
                autolink: true,
                protocols: ['mailto', 'https', 'http'],
            }),
            ListItem,
            BulletList,
            OrderedList,
            // CodeBlock.configure({
            //     lowlight: lowlight,
            // }),
            Placeholder.configure({
                placeholder: 'Type a message...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onUpdate(editor.getHTML())
        },
        editable: true,
        autofocus: true,
    });

    return (
        <div className={`tiptap-editor-container ${isDarkMode ? 'dark' : ''}`}>
            {editor && (
                <BubbleMenu
                    editor={editor}
                    tippyOptions={{
                        duration: 100,
                        arrow: true,
                        offset: [0, 10]
                    }}
                >
                    <TextFormattingMenu editor={editor} />
                </BubbleMenu>
            )}
            <EditorContent editor={editor} />
        </div>
    );
}

export default TiptapEditor;