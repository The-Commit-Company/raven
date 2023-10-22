import { Box, ButtonGroup, HStack, IconButton, StackDivider, border, useColorModeValue } from '@chakra-ui/react'
import { useCurrentEditor } from '@tiptap/react'
import { BiBold, BiCode, BiCodeAlt, BiHighlight, BiItalic, BiLink, BiListOl, BiListUl, BiStrikethrough, BiUnderline } from 'react-icons/bi'
import { BsBlockquoteLeft } from 'react-icons/bs'
import { ICON_PROPS } from './ToolPanel'

type Props = {}
export const TextFormattingMenu = (props: Props) => {

    const { editor } = useCurrentEditor()

    const highlightBgColor = useColorModeValue('blue.50', 'blue.900')

    if (!editor) {
        return <Box></Box>
    }
    return (
        // <BubbleMenu tippyOptions={{
        //     maxWidth: '600px',
        // }}>
        <HStack divider={<StackDivider />}>
            <ButtonGroup size='xs' variant={'ghost'}>
                <IconButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    aria-label='bold'
                    title='Bold'
                    icon={<BiBold {...ICON_PROPS} />}
                    colorScheme={editor.isActive('bold') ? 'blue' : 'gray'}
                    bgColor={editor.isActive('bold') ? highlightBgColor : 'transparent'}
                    isDisabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleBold()
                            .run()
                    } />

                <IconButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    aria-label='italic'
                    title='Italic'
                    icon={<BiItalic size='18px' />}
                    colorScheme={editor.isActive('italic') ? 'blue' : 'gray'}
                    bgColor={editor.isActive('italic') ? highlightBgColor : 'transparent'}
                    isDisabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleItalic()
                            .run()
                    } />
                <IconButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    aria-label='underline'
                    title='Underline'
                    icon={<BiUnderline {...ICON_PROPS} />}
                    colorScheme={editor.isActive('underline') ? 'blue' : 'gray'}
                    bgColor={editor.isActive('underline') ? highlightBgColor : 'transparent'}
                    isDisabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleUnderline()
                            .run()
                    }
                />


            </ButtonGroup>
            <ButtonGroup size='xs' variant='ghost'>

                <IconButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    aria-label='code'
                    title='Code'
                    icon={<BiCodeAlt {...ICON_PROPS} />}
                    colorScheme={editor.isActive('codeBlock') ? 'blue' : 'gray'}
                    bgColor={editor.isActive('codeBlock') ? highlightBgColor : 'transparent'}
                    isDisabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleCodeBlock()
                            .run()
                    }
                />
                <IconButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    aria-label='strike'
                    title='Strike'
                    icon={<BiStrikethrough {...ICON_PROPS} />}
                    colorScheme={editor.isActive('strike') ? 'blue' : 'gray'}
                    bgColor={editor.isActive('strike') ? highlightBgColor : 'transparent'}
                    isDisabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleStrike()
                            .run()
                    }
                />



                <IconButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    aria-label='blockquote'
                    bgColor={editor.isActive('blockquote') ? highlightBgColor : 'transparent'}
                    title='Blockquote'
                    isDisabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleBlockquote()
                            .run()
                    }
                    icon={<BsBlockquoteLeft {...ICON_PROPS} />}
                    colorScheme={editor.isActive('blockquote') ? 'blue' : 'gray'}
                />
            </ButtonGroup>
            <ButtonGroup size='xs' variant={'ghost'}>
                <IconButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    aria-label='ordered list'
                    title='Ordered List'
                    icon={<BiListOl {...ICON_PROPS} />}
                    colorScheme={editor.isActive('orderedList') ? 'blue' : 'gray'}
                    bgColor={editor.isActive('orderedList') ? highlightBgColor : 'transparent'}
                    isDisabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleOrderedList()
                            .run()
                    }
                />
                <IconButton
                    onClick={() => editor.chain().focus().liftEmptyBlock().toggleBulletList().run()}
                    aria-label='bullet list'
                    title='Bullet List'
                    bgColor={editor.isActive('bulletList') ? highlightBgColor : 'transparent'}
                    icon={<BiListUl {...ICON_PROPS} />}
                    colorScheme={editor.isActive('bulletList') ? 'blue' : 'gray'}
                    isDisabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleBulletList()
                            .run()
                    }
                />

            </ButtonGroup>

            <ButtonGroup size='xs' variant={'ghost'}>
                <IconButton
                    aria-label='highlight'
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    title='Highlight'
                    bgColor={editor.isActive('highlight') ? highlightBgColor : 'transparent'}
                    icon={<BiHighlight fontSize='18px' />}
                    isDisabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleHighlight()
                            .run()
                    }
                />
            </ButtonGroup>
        </HStack>
        // </BubbleMenu>
    )
}