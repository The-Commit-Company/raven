"use dom";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Link from "@tiptap/extension-link";
import Bold from "@tiptap/extension-bold";
import Underline from "@tiptap/extension-underline";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import History from "@tiptap/extension-history";
import Placeholder from "@tiptap/extension-placeholder";
import { useSize } from "./useSize";
import TextFormattingMenu from "./TextFormattingMenu";

import styles from "./tiptap.module.css";
import { CustomFile } from "@raven/types/common/File";

interface TiptapProps {
    content: string;
    onDOMLayout: (size: { width: number; height: number }) => void;
    dom: import('expo/dom').DOMProps
    onSend: (files?: CustomFile[], content?: string, json?: any) => Promise<void>
}

const Tiptap = ({
    content,
    dom,
    onDOMLayout,
    onSend,
}: TiptapProps) => {

    // Get a ref that is attached to the root element of this component.
    const sizeRef = useSize(onDOMLayout);

    // Initialize editor with content; ensure content is never undefined.
    const editor = useEditor({
        extensions: [
            Document,
            History,
            Paragraph,
            Text,
            Link.configure({
                openOnClick: false,
            }),
            Bold,
            Underline,
            Italic,
            Strike,
            Code,
            Placeholder.configure({
                placeholder: 'Type a message...',
            }),
        ],
        content: '',
        autofocus: "end",
    });

    const [isFormattingMenuOpen, setIsFormattingMenuOpen] = useState(false);

    const handleClick = () => {
        setIsFormattingMenuOpen(!isFormattingMenuOpen)
        // click should not unfocus the editor
        editor?.chain().focus().run()
    }

    const handleCloseFormattingMenu = () => {
        setIsFormattingMenuOpen(false)
        // click should not unfocus the editor
        editor?.chain().focus().run()
    }

    const handleSend = () => {
        const content = editor?.getText()
        const json = editor?.getJSON()
        if (content) {
            onSend([], content, json).then(() => {
                // focus the editor
                editor?.chain().focus().run()
                // clear the editor
                editor?.commands.setContent('')
                // close the formatting menu
                setIsFormattingMenuOpen(false)
            }).catch((error) => {
                console.error(error)
            })
        }
    }

    return (
        <div
            ref={sizeRef}
            style={{
                width: '100%',
                overflowY: 'hidden',
                // Enables scrolling once max height is exceeded
                // If the native side provides a container style (width/height), use it.

            }}

        >
            <EditorContent
                editor={editor}
            />

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                {/* text formatting button opens up the text formatting menu */}
                {!isFormattingMenuOpen ? (
                    <button
                        onClick={handleClick}
                    >
                        Aa
                    </button>
                ) : (
                    <div>
                        {editor && (
                            <TextFormattingMenu editor={editor} handleCloseFormattingMenu={handleCloseFormattingMenu} />
                        )}
                    </div>
                )}


                <div>
                    <button
                        className={styles["menu-button"]}
                        onClick={handleSend}
                    >
                        <IconSend />
                    </button>
                </div>
            </div>
        </div>
    );
};

const IconSend = ({ size = 16, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" style={{ fill: color, transform: 'none', msFilter: 'none' }}>
        <path d="m21.426 11.095-17-8A1 1 0 0 0 3.03 4.242l1.212 4.849L12 12l-7.758 2.909-1.212 4.849a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81z"></path>
    </svg>
)

export default Tiptap;