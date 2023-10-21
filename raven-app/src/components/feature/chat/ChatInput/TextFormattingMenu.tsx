import { Button, ButtonGroup, Divider, HStack, IconButton, StackDivider, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { BubbleMenu, useCurrentEditor } from '@tiptap/react'
import { BiBold, BiCode, BiHighlight, BiItalic, BiLink, BiListOl, BiListUl, BiRedo, BiStrikethrough, BiUnderline, BiUndo } from 'react-icons/bi'
import { BsBlockquoteLeft } from 'react-icons/bs'

type Props = {}
const ICON_PROPS = {
    size: '20px'
}
export const TextFormattingMenu = (props: Props) => {

    const { editor } = useCurrentEditor()

    const buttonGroupBgColor = useColorModeValue('white', 'gray.900')

    if (!editor) {
        return null
    }
    return (
        <BubbleMenu tippyOptions={{
            maxWidth: '600px',
        }}>
            <HStack divider={<StackDivider />} bgColor={buttonGroupBgColor} p='1.5' spacing='1' rounded='md' shadow={'md'}>
                <ButtonGroup size='sm' spacing='0' variant={'ghost'}>
                    <IconButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        aria-label='bold'
                        title='Bold'
                        icon={<BiBold {...ICON_PROPS} />}
                        colorScheme={editor.isActive('bold') ? 'blue' : 'gray'}
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
                        isDisabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .toggleUnderline()
                                .run()
                        }
                    />


                </ButtonGroup>
                <ButtonGroup size='sm' spacing='0' variant={'ghost'}>

                    <IconButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        aria-label='code'
                        title='Code'
                        icon={<BiCode {...ICON_PROPS} />}
                        colorScheme={editor.isActive('code') ? 'blue' : 'gray'}
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
                        icon={<BsBlockquoteLeft {...ICON_PROPS} />}
                        colorScheme={editor.isActive('blockquote') ? 'blue' : 'gray'}
                    />
                </ButtonGroup>
                <ButtonGroup size='sm' spacing='0' variant={'ghost'}>
                    <IconButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        aria-label='ordered list'
                        title='Ordered List'
                        icon={<BiListOl {...ICON_PROPS} />}
                        colorScheme={editor.isActive('orderedList') ? 'blue' : 'gray'}
                        isDisabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .toggleOrderedList()
                                .run()
                        }
                    />
                    <IconButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        aria-label='bullet list'
                        title='Bullet List'
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

                <ButtonGroup size='sm' spacing='0' variant={'ghost'}>
                    <IconButton
                        aria-label='highlight'
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        title='Highlight'
                        icon={<BiHighlight {...ICON_PROPS} />}
                        isDisabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .toggleHighlight()
                                .run()
                        }
                    />
                    <Button
                        onClick={() => editor.chain().focus().undo().run()}
                        hidden={
                            !editor.can()
                                .chain()
                                .focus()
                                .undo()
                                .run()
                        }
                        leftIcon={<BiUndo {...ICON_PROPS} />}
                        aria-label='undo'
                    >
                        Undo
                    </Button>

                    <Button
                        onClick={() => editor.chain().focus().redo().run()}
                        hidden={
                            !editor.can()
                                .chain()
                                .focus()
                                .redo()
                                .run()
                        }
                        leftIcon={<BiRedo {...ICON_PROPS} />}
                        aria-label='redo'
                    >
                        Redo
                    </Button>
                </ButtonGroup>
            </HStack>
        </BubbleMenu>
    )
}