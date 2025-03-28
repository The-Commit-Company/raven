"use dom";

import { useEffect, useState } from "react";
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
import { cn } from "@lib/cn";
import styles from "./tiptap.module.css";
import './tiptap.css'
import { BiSolidSend } from "react-icons/bi";

interface TiptapProps {
    content: string;
    dom: import('expo/dom').DOMProps;
    onBlur: (content: string, json: any) => void;
    onSend: (content?: string, json?: any) => Promise<void>;
    isKeyboardVisible: boolean;
}

const Tiptap = ({
    content,
    dom,
    onBlur,
    isKeyboardVisible,
    onSend,
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
        onBlur: ({ editor }) => {
            if (editor?.isEmpty) {
                onBlur('', null)
            } else {
                onBlur(editor.getHTML(), editor.getJSON())
            }
        }
    });

    useEffect(() => {
        editor?.chain().setContent(content).run()
    }, [content])

    const keepEditorFocused = () => {
        editor?.chain().focus().run()
    }

    const [isFormattingMenuOpen, setIsFormattingMenuOpen] = useState(false);

    const handleFormattingMenuButtonClick = () => {
        setIsFormattingMenuOpen(!isFormattingMenuOpen)
        keepEditorFocused()
    }

    const handleCloseFormattingMenu = () => {
        setIsFormattingMenuOpen(false)
        keepEditorFocused()
    }

    const handleSend = () => {
        if (editor?.isEmpty) {
            onSend('', null)
        } else {
            onSend(editor?.getHTML(), editor?.getJSON())
                .then(() => {
                    editor?.commands?.clearContent(true)
                })
        }
    }

    return (
        <div
            className={styles.editorContainer}
        >
            <EditorContent
                editor={editor}
                className={styles.editorContent}
            />

            {isKeyboardVisible && (
                <div
                    className={styles.menu}
                >
                    {!isFormattingMenuOpen ? (
                        <button
                            className={styles["format-button"]}
                            onClick={handleFormattingMenuButtonClick}
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
                            editor?.getText().trim() ? styles["send-button-active"] : ''
                        )}
                        onClick={handleSend}
                    >
                        <BiSolidSend size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default Tiptap;