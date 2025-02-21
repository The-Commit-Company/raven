"use dom";

import { Editor, useCurrentEditor } from '@tiptap/react'

import { useCallback } from 'react';
import classNames from "classnames";
import styles from "./tiptap.module.css";
import { cn } from "@lib/cn";

import { useColorScheme } from "@hooks/useColorScheme"
import BoldIcon from "@assets/icons/formatting-icons/Bold.svg"
import UnderlineIcon from "@assets/icons/formatting-icons/Underline.svg"
import ItalicIcon from "@assets/icons/formatting-icons/Italic.svg"
import StrikethroughIcon from "@assets/icons/formatting-icons/Strikethrough.svg"
import CodeIcon from "@assets/icons/formatting-icons/Code.svg"
import CodeBlockIcon from "@assets/icons/formatting-icons/CodeBlock.svg"
import OLListIcon from "@assets/icons/formatting-icons/OLList.svg"
import ULListIcon from "@assets/icons/formatting-icons/ULList.svg"
import XIcon from "@assets/icons/CrossIcon.svg"

const TextFormattingMenu = (
    {
        editor,
        handleCloseFormattingMenu
    }: {
        editor: Editor,
        handleCloseFormattingMenu: () => void
    }
) => {

    if (!editor) {
        return null;
    }

    const { colors } = useColorScheme()

    const toggleBold = useCallback(() => {
        editor.chain().focus().toggleBold().run();
    }, [editor]);

    const toggleUnderline = useCallback(() => {
        editor.chain().focus().toggleUnderline().run();
    }, [editor]);

    const toggleItalic = useCallback(() => {
        editor.chain().focus().toggleItalic().run();
    }, [editor]);

    const toggleStrike = useCallback(() => {
        editor.chain().focus().toggleStrike().run()
    }, [editor]);

    const toggleCode = useCallback(() => {
        editor.chain().focus().toggleCode().run();
    }, [editor]);

    const toggleBulletList = useCallback(() => {
        editor.chain().focus().toggleBulletList().run()
    }, [editor]);

    const toggleOrderedList = useCallback(() => {
        editor.chain().focus().toggleOrderedList().run()
    }, [editor]);

    // const toggleCodeBlock = useCallback(() => {
    //     editor.chain().focus().toggleCodeBlock().run();
    // }, [editor]);

    return (
        <div
            className={styles["formatting-menu"]}>
            <button
                className={
                    cn(
                        styles["formatting-button"],
                    )
                }
                onClick={handleCloseFormattingMenu}
            >
                <XIcon fill={colors.grey} />
            </button>

            <button
                className={cn(
                    styles["formatting-button"],
                )}
                onClick={toggleBold}
            >
                <BoldIcon fill={editor.isActive('bold') ? colors.primary : colors.grey} />
            </button>

            <button
                className={cn(
                    styles["formatting-button"],
                )}
                onClick={toggleItalic}
            >
                <ItalicIcon fill={editor.isActive('italic') ? colors.primary : colors.grey} />
            </button>

            <button
                className={cn(
                    styles["formatting-button"],
                )}
                onClick={toggleUnderline}
            >
                <UnderlineIcon fill={editor.isActive('underline') ? colors.primary : colors.grey} />
            </button>

            <button
                className={cn(
                    styles["formatting-button"],
                )}
                onClick={toggleStrike}
            >
                <StrikethroughIcon fill={editor.isActive('strike') ? colors.primary : colors.grey} />
            </button>

            <button
                className={cn(
                    styles["formatting-button"],
                )}
                onClick={toggleOrderedList}
            >
                <OLListIcon fill={editor.isActive('orderedList') ? colors.primary : colors.grey} />
            </button>

            <button
                className={cn(
                    styles["formatting-button"],
                )}
                onClick={toggleBulletList}
            >
                <ULListIcon fill={editor.isActive('bulletList') ? colors.primary : colors.grey} />
            </button>

            <button
                className={cn(
                    styles["formatting-button"],
                )}
                onClick={toggleCode}
            >
                <CodeIcon fill={editor.isActive('code') ? colors.primary : colors.grey} />
            </button>
            {/* <button
                className={cn(
                    styles["formatting-button"],
                    editor.isActive('codeBlock') && styles["is-active"]
                )}
                onClick={toggleCodeBlock}
            >
                <CodeBlockIcon fill={colors.grey} />
            </button> */}

        </div >
    );
}

export default TextFormattingMenu;