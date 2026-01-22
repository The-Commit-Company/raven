/**
 * TextFormattingBubbleMenu.tsx - Bubble menu for text formatting
 *
 * Appears when user selects text in the editor.
 * Contains all formatting options: Bold, Italic, Underline, Strike, Code, etc.
 *
 */

import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Button } from '@components/ui/button'
import { Separator } from '@components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Quote,
    List,
    ListOrdered,
    Link,
    FileCode2
} from 'lucide-react'

const ICON_SIZE = 14

/**
 * Keyboard shortcut display helper.
 */
const getMetaKey = () => {
    if (typeof navigator === 'undefined') return 'Ctrl'
    // .platform is now deprecated, use .userAgent instead (fallback to platform)
    const platform = navigator?.userAgent || navigator?.platform;

    return platform.includes('Mac') ? '⌘' : 'Ctrl'

}

export const TextFormattingBubbleMenu = () => {
    const { editor } = useCurrentEditor()

    const editorState = useEditorState({
        editor,
        selector: ({ editor }) => {
            if (!editor) {
                return {
                    isBold: false,
                    isItalic: false,
                    isUnderline: false,
                    isStrike: false,
                    isCode: false,
                    isBlockquote: false,
                    isBulletList: false,
                    isOrderedList: false,
                    isLink: false,
                    isCodeBlock: false,
                }
            }
            return {
                isBold: editor.isActive('bold'),
                isItalic: editor.isActive('italic'),
                isUnderline: editor.isActive('underline'),
                isStrike: editor.isActive('strike'),
                isCode: editor.isActive('code'),
                isBlockquote: editor.isActive('blockquote'),
                isBulletList: editor.isActive('bulletList'),
                isOrderedList: editor.isActive('orderedList'),
                isLink: editor.isActive('link'),
                isCodeBlock: editor.isActive('codeBlock'),
            }
        },
    })

    if (!editor || !editorState) return null

    const metaKey = getMetaKey()

    return (
        <BubbleMenu
            editor={editor}
            className="flex items-center gap-0.5 p-1 bg-popover border border-border rounded-lg shadow-lg"
        >
            {/* Basic formatting */}
            <FormatButton
                icon={<Bold size={ICON_SIZE} />}
                tooltip={`Bold (${metaKey}+B)`}
                isActive={editorState.isBold}
                onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <FormatButton
                icon={<Italic size={ICON_SIZE} />}
                tooltip={`Italic (${metaKey}+I)`}
                isActive={editorState.isItalic}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <FormatButton
                icon={<Underline size={ICON_SIZE} />}
                tooltip={`Underline (${metaKey}+U)`}
                isActive={editorState.isUnderline}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
            <FormatButton
                icon={<Strikethrough size={ICON_SIZE} />}
                tooltip="Strikethrough"
                isActive={editorState.isStrike}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            />

            <div className="h-6">
                <Separator orientation="vertical" />
            </div>

            {/* Code */}
            <FormatButton
                icon={<Code size={ICON_SIZE} />}
                tooltip={`Code (${metaKey}+E)`}
                isActive={editorState.isCode}
                onClick={() => editor.chain().focus().toggleCode().run()}
            />

            <FormatButton
                icon={<FileCode2 size={ICON_SIZE} />}
                tooltip={`Code Block (${metaKey}+Shift+E)`}
                isActive={editorState.isCodeBlock}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            />

            <div className="h-6">
                <Separator orientation="vertical" />
            </div>

            {/* Link */}
            <FormatButton
                icon={<Link size={ICON_SIZE} />}
                tooltip="Add link"
                isActive={editorState.isLink}
                onClick={() => {
                    // TODO: Open link modal for better UX
                    const url = window.prompt('Enter URL')
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run()
                    }
                }}
            />

            <div className="h-6">
                <Separator orientation="vertical" />
            </div>

            {/* Block formatting */}
            <FormatButton
                icon={<Quote size={ICON_SIZE} />}
                tooltip="Blockquote"
                isActive={editorState.isBlockquote}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
            <FormatButton
                icon={<ListOrdered size={ICON_SIZE} />}
                tooltip="Ordered List"
                isActive={editorState.isOrderedList}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <FormatButton
                icon={<List size={ICON_SIZE} />}
                tooltip="Bullet List"
                isActive={editorState.isBulletList}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
        </BubbleMenu>
    )
}


/**
 * Individual formatting button with tooltip.
 */
interface FormatButtonProps {
    icon: React.ReactNode
    tooltip: string
    isActive: boolean
    onClick: () => void
}

const FormatButton = ({ icon, tooltip, isActive, onClick }: FormatButtonProps) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
                    onClick={onClick}
                    data-active={isActive}
                >
                    {icon}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    )
}

export default TextFormattingBubbleMenu
