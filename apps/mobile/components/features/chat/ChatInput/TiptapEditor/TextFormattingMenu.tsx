"use dom";

import { Editor } from '@tiptap/react'

import { cn } from "@lib/cn";

import { useColorScheme } from "@hooks/useColorScheme"
import BoldIcon from "@assets/icons/formatting-icons/Bold.svg"
import UnderlineIcon from "@assets/icons/formatting-icons/Underline.svg"
import ItalicIcon from "@assets/icons/formatting-icons/Italic.svg"
import StrikethroughIcon from "@assets/icons/formatting-icons/Strikethrough.svg"
import CodeIcon from "@assets/icons/formatting-icons/Code.svg"
import OLListIcon from "@assets/icons/formatting-icons/OLList.svg"
import ULListIcon from "@assets/icons/formatting-icons/ULList.svg"

import "./tiptap.css"

const TextFormattingMenu = (
    {
        editor,
    }: {
        editor: Editor,
    }
) => {

    if (!editor) {
        return null;
    }

    const { colors } = useColorScheme()

    return (
        <div className="bubble-menu">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(editor.isActive('bold') ? 'is-active' : '')}
            >
                <BoldIcon fill={editor.isActive('bold') ? colors.background : colors.grey2} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(editor.isActive('italic') ? 'is-active' : '')}
            >
                <ItalicIcon fill={editor.isActive('italic') ? colors.background : colors.grey2} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn(editor.isActive('underline') ? 'is-active' : '')}
            >
                <UnderlineIcon fill={editor.isActive('underline') ? colors.background : colors.grey2} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(editor.isActive('strike') ? 'is-active' : '')}
            >
                <StrikethroughIcon fill={editor.isActive('strike') ? colors.background : colors.grey2} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(editor.isActive('bulletList') ? 'is-active' : '')}
            >
                <ULListIcon fill={editor.isActive('bulletList') ? colors.background : colors.grey2} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(editor.isActive('orderedList') ? 'is-active' : '')}
            >
                <OLListIcon fill={editor.isActive('orderedList') ? colors.background : colors.grey2} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn(editor.isActive('code') ? 'is-active' : '')}
            >
                <CodeIcon fill={editor.isActive('code') ? colors.background : colors.grey2} />
            </button>
        </div>
    );
}

export default TextFormattingMenu;