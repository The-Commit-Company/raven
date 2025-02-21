"use dom";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
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
import TextFormattingMenu from "./TextFormattingMenu";
import "./tiptap.css";

import styles from "./tiptap.module.css";
import { CustomFile } from "@raven/types/common/File";
import { cn } from "@lib/cn";

interface TiptapProps {
    content: string;
    dom: import('expo/dom').DOMProps;
    onSend: (files?: CustomFile[], content?: string, json?: any) => Promise<void>;
    isKeyboardVisible: boolean;
}

const Tiptap = ({
    content,
    dom,
    onSend,
    isKeyboardVisible
}: TiptapProps) => {
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
            className={styles["tiptap-editor"]}
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            <EditorContent
                editor={editor}
                className={styles.editorContent}
                style={{
                    flex: 1,
                    maxHeight: 60,
                    overflowY: 'auto',
                }}
            />

            {isKeyboardVisible && (
                <div className={styles.menu}>
                    {!isFormattingMenuOpen ? (
                        <button
                            className={styles["format-button"]}
                            onClick={handleClick}
                        >
                            <span className={styles["format-button-text"]}>Aa</span>
                        </button>
                    ) : (
                        <TextFormattingMenu
                            editor={editor!}
                            handleCloseFormattingMenu={handleCloseFormattingMenu}
                        />
                    )}

                    <button
                        className={cn(
                            styles["send-button"],
                            editor?.getText().trim() && styles["send-button-active"]
                        )}
                        onClick={handleSend}
                        disabled={!editor?.getText().trim()}
                    >
                        <IconSend />
                    </button>
                </div>
            )}
        </div>
    );
};

const IconSend = ({ size = 20, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" style={{ fill: color, transform: 'none', msFilter: 'none' }}>
        <path d="m21.426 11.095-17-8A1 1 0 0 0 3.03 4.242l1.212 4.849L12 12l-7.758 2.909-1.212 4.849a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81z"></path>
    </svg>
)

export default Tiptap;