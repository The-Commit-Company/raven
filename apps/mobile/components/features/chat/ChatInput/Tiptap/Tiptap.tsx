"use dom";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
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
import TextFormattingMenu from "./TextFormattingMenu";
import ListItem from "@tiptap/extension-list-item"
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import "./tiptap.css";

import { useColorScheme } from "@hooks/useColorScheme"
import { CustomFile } from "@raven/types/common/File";
import { cn } from "@lib/cn";
import styles from "./tiptap.module.css";
import SendIcon from "@assets/icons/SendIcon.svg"

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
        content: '',
        autofocus: "end",
    });

    const { colors } = useColorScheme()
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
                        )}
                        onClick={handleSend}
                        disabled={!editor?.getText().trim()}
                    >
                        <SendIcon fill={
                            editor?.getText().trim() ? colors.primary : colors.grey
                        } />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Tiptap;