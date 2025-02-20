import { useCurrentEditor } from '@tiptap/react'
import { BiBold, BiCodeAlt, BiCodeBlock, BiHighlight, BiItalic, BiListOl, BiListUl, BiStrikethrough, BiUnderline, BiSolidQuoteAltRight, BiTime } from 'react-icons/bi'
import { DEFAULT_BUTTON_STYLE, ICON_PROPS } from './ToolPanel'
import { Box, Flex, IconButton, Separator, Tooltip } from '@radix-ui/themes'
import { getKeyboardMetaKeyString } from '@/utils/layout/keyboardKey'
import { memo } from 'react'

export const TextFormattingMenu = memo(() => {

    const { editor } = useCurrentEditor()

    const highlightBgColor = 'bg-accent-a3'

    if (!editor) {
        return <Box></Box>
    }
    return (
        <Flex gap='2' align='center' px='1' py='1' className='sm:max-w-[60%] max-w-[100%] overflow-x-auto'>
            <Flex gap='3' align='center'>
                <Tooltip content={getKeyboardMetaKeyString() + ' + B'} aria-label={getKeyboardMetaKeyString() + ' + B'}>
                    <IconButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        aria-label='bold'
                        variant='ghost'
                        title='Bold'
                        size='1'
                        className={editor.isActive('bold') ? highlightBgColor : DEFAULT_BUTTON_STYLE}
                        disabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .toggleBold()
                                .run()
                        }>
                        <BiBold {...ICON_PROPS} />
                    </IconButton>
                </Tooltip>
                <Tooltip content={getKeyboardMetaKeyString() + ' + I'} aria-label={getKeyboardMetaKeyString() + ' + I'}>
                    <IconButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        aria-label='italic'
                        title='Italic'
                        variant='ghost'
                        size='1'
                        className={editor.isActive('italic') ? highlightBgColor : DEFAULT_BUTTON_STYLE}
                        disabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .toggleItalic()
                                .run()
                        }>
                        <BiItalic {...ICON_PROPS} />
                    </IconButton>
                </Tooltip>
                <Tooltip content={getKeyboardMetaKeyString() + ' + U'} aria-label={getKeyboardMetaKeyString() + ' + U'}>
                    <IconButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        aria-label='underline'
                        title='Underline'
                        variant='ghost'
                        size='1'
                        className={editor.isActive('underline') ? highlightBgColor : DEFAULT_BUTTON_STYLE}
                        disabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .toggleUnderline()
                                .run()
                        }
                    >
                        <BiUnderline {...ICON_PROPS} />
                    </IconButton>
                </Tooltip>
            </Flex>
            <Separator orientation='vertical' />
            <Flex gap='3' align='center'>
                <Tooltip content={getKeyboardMetaKeyString() + ' + E'} aria-label={getKeyboardMetaKeyString() + ' + E'}>
                    <IconButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        aria-label='code'
                        variant='ghost'
                        size='1'
                        title='Code'
                        className={editor.isActive('code') ? highlightBgColor : DEFAULT_BUTTON_STYLE}
                        disabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .toggleCode()
                                .run()
                        }
                    >
                        <BiCodeAlt {...ICON_PROPS} />
                    </IconButton>
                </Tooltip>
                <Tooltip content={getKeyboardMetaKeyString() + '+ Shift + E'} aria-label={getKeyboardMetaKeyString() + '+ Shift + E'}>
                    <IconButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        aria-label='code block'
                        variant='ghost'
                        size='1'
                        title='Code Block'
                        className={editor.isActive('codeBlock') ? highlightBgColor : DEFAULT_BUTTON_STYLE}
                        disabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .toggleCodeBlock()
                                .run()
                        }
                    >
                        <BiCodeBlock {...ICON_PROPS} />
                    </IconButton>
                </Tooltip>
                {/* <Tooltip content={getKeyboardMetaKeyString() + ' + Shift + X'} aria-label={getKeyboardMetaKeyString() + ' + Shift + X'}> */}
                <IconButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    aria-label='strike'
                    variant='ghost'
                    size='1'
                    title='Strike'
                    className={editor.isActive('strike') ? highlightBgColor : DEFAULT_BUTTON_STYLE}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleStrike()
                            .run()
                    }
                >
                    <BiStrikethrough {...ICON_PROPS} />
                </IconButton>
                {/* </Tooltip> */}
                {/* <Tooltip content={getKeyboardMetaKeyString() + ' + Shift + B'} aria-label={getKeyboardMetaKeyString() + ' + Shift + B'}> */}
                <IconButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    aria-label='blockquote'
                    className={editor.isActive('blockquote') ? highlightBgColor : DEFAULT_BUTTON_STYLE}
                    title='Blockquote'
                    size='1'
                    variant='ghost'
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleBlockquote()
                            .run()
                    }
                >
                    <BiSolidQuoteAltRight {...ICON_PROPS} />
                </IconButton>
                {/* </Tooltip> */}
            </Flex>
            <Separator orientation='vertical' />
            <Flex gap='3' align='center'>
                <Tooltip content={getKeyboardMetaKeyString() + ' + Shift + 7'} aria-label={getKeyboardMetaKeyString() + ' + Shift + 7'}>
                    <IconButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        aria-label='ordered list'
                        title='Ordered List'
                        size='1'
                        variant='ghost'
                        className={editor.isActive('orderedList') ? highlightBgColor : DEFAULT_BUTTON_STYLE}
                        disabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .toggleOrderedList()
                                .run()
                        }
                    >
                        <BiListOl {...ICON_PROPS} />
                    </IconButton>
                </Tooltip>
                <Tooltip content={getKeyboardMetaKeyString() + ' + Shift + 8'} aria-label={getKeyboardMetaKeyString() + ' + Shift + 8'}>
                    <IconButton
                        onClick={() => editor.chain().focus().liftEmptyBlock().toggleBulletList().run()}
                        aria-label='bullet list'
                        title='Bullet List'
                        size='1'
                        variant='ghost'
                        className={editor.isActive('bulletList') ? highlightBgColor : DEFAULT_BUTTON_STYLE}
                        disabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .toggleBulletList()
                                .run()
                        }
                    >
                        <BiListUl {...ICON_PROPS} />
                    </IconButton>
                </Tooltip>
            </Flex>
            <Separator orientation='vertical' />
            <Flex gap='3' align='center'>
                <Tooltip content={getKeyboardMetaKeyString() + ' + Shift + H'} aria-label={getKeyboardMetaKeyString() + ' + Shift + H'}>
                    <IconButton
                        aria-label='highlight'
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        title='Highlight'
                        variant='ghost'
                        size='1'
                        className={editor.isActive('highlight') ? highlightBgColor : DEFAULT_BUTTON_STYLE}
                        disabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .toggleHighlight()
                                .run()
                        }
                    >
                        <BiHighlight {...ICON_PROPS} />
                    </IconButton>
                </Tooltip>
            </Flex>
            <TimestampButton />
        </Flex>
    )
})

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


    return <Flex gap='3' align='center'>
        <IconButton
            aria-label='Parse timestamps from message'
            onClick={onClick}
            title='Parse timestamps from message'
            variant='ghost'
            size='1'
            className={DEFAULT_BUTTON_STYLE}
            disabled={!editor.can().chain().focus().run()}
        >
            <BiTime {...ICON_PROPS} />
        </IconButton>
    </Flex>


}
