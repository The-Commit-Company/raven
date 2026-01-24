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
    FileCode2,
    Box,
    Clock7
} from 'lucide-react'
import { useState } from 'react'
import LinkEmbeddingModal from '@components/features/ChatInput/LinkEmbeddingModal'

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
    const [isLinkEmbeddingModalOpen, setIsLinkEmbeddingModalOpen] = useState(false)
    const [linkModalData, setLinkModalData] = useState<{ text: string, link: string }>({ text: '', link: '' })

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

    // for Link Embedding Modal
    const handleLinkButtonClick = () => {
        const { from, to } = editor.state.selection
        const selectedText = editor.state.doc.textBetween(from, to, ' ')

        const linkAttrs = editor.isActive('link') ? editor.getAttributes('link') : {}

        // Store these values in state to pass to modal
        setLinkModalData({
            text: selectedText,
            link: linkAttrs.href || ''
        })

        // Open modal with correct values
        setIsLinkEmbeddingModalOpen(true)
    }

    const onSaveLinkEmbedding = (data: { link: string, text: string }) => {
        if (data.text && data.link) {
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: data.link })
                .insertContent(data.text)
                .run()
        }
    }

    const handleCloseLinkEmbeddingModal = () => {
        setLinkModalData({ text: '', link: '' })
        setIsLinkEmbeddingModalOpen(false)
    }

    return (
        <>
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
                    tooltip="Link"
                    isActive={editorState.isLink}
                    onClick={handleLinkButtonClick}
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

                <div className="h-6">
                    <Separator orientation="vertical" />
                </div>
                {/* Timestamp */}
                <TimestampButton />
                <LinkEmbeddingModal
                    isOpen={isLinkEmbeddingModalOpen}
                    onClose={handleCloseLinkEmbeddingModal}
                    onSave={onSaveLinkEmbedding}
                    linkModalData={linkModalData}
                />
            </BubbleMenu>
        </>
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

const TimestampButton = () => {
    const { editor } = useCurrentEditor()

    const parseDates = async (content: string): Promise<string> => {
        let parsedContent = content

        // Lazy import chrono-node
        const chrono = await import('chrono-node')

        const parsedDates = chrono.parse(parsedContent, undefined, {
            forwardDate: true
        })

        // Sort parsedDates in reverse order based on their index. This is to ensure that we replace from the end to preserve the indices of the replaced strings.
        parsedDates.sort((a, b) => b.index - a.index)

        parsedDates.forEach(date => {

            // Ignore if neither hour, minute, or date is certain
            if (!date.start.isCertain('hour') && !date.start.isCertain('minute') && !date.start.isCertain('day')) {
                return
            }

            const hasStartTime = date.start.isCertain('hour') && date.start.isCertain('minute')

            const startTime: number = date.start.date().getTime()

            const endTime: number | null = date.end?.date().getTime() ?? null

            const hasEndTime = endTime ? date.end?.isCertain('hour') && date.end?.isCertain('minute') : false

            // Replace the text with a span containing the timestamp after the given "index")
            const index = date.index
            const text = date.text

            let attributes = ''
            if (startTime) attributes += `data-timestamp-start="${startTime}"`

            if (endTime) attributes += ` data-timestamp-end="${endTime}"`

            if (!hasStartTime) {
                attributes += ' data-timestamp-start-all-day="true"'
            }

            if (!hasEndTime) {
                attributes += ' data-timestamp-end-all-day="true"'
            }

            parsedContent = parsedContent.slice(0, index) + `<span class="timestamp" ${attributes}">${text}</span>` + parsedContent.slice(index + text.length)
        })
        return parsedContent
    }

    const onClick = async () => {
        if (editor) {
            // Check if editor has selected text
            const { from, to, replaceWith, empty } = editor.state.selection

            if (empty) {
                const content = editor.getHTML()
                const parsedContent = await parseDates(content)
                editor.chain().focus().setContent(parsedContent).run()
            } else {
                const selectedText = editor.view.state.doc.textBetween(from, to, ' ')
                const parsedContent = await parseDates(selectedText)

                // Replace only the selected text with the parsed content
                editor.chain().focus().deleteSelection().insertContent(parsedContent).run()
            }

        }

    }

    if (!editor) {
        return <Box></Box>
    }


    return <div className='gap-3 items-center'>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    aria-label='Parse timestamps from message'
                    onClick={onClick}
                    title='Parse timestamps from message'
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                    disabled={!editor.can().chain().focus().run()}
                >
                    <Clock7 size={ICON_SIZE} />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
                Add timestamps to message
            </TooltipContent>
        </Tooltip>
    </div>


}

export default TextFormattingBubbleMenu
