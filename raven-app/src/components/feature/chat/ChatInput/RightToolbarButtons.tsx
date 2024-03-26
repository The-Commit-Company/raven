import { useCurrentEditor } from '@tiptap/react'
import { BiAt, BiHash, BiSmile, BiPaperclip, BiSolidSend } from 'react-icons/bi'
import { DEFAULT_BUTTON_STYLE, ICON_PROPS } from './ToolPanel'
import { ToolbarFileProps } from './Tiptap'
import { Flex, IconButton, Inset, Popover, Separator } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import { Suspense, lazy } from 'react'
import { HiOutlineGif } from "react-icons/hi2";
import { GIFPicker } from '@/components/common/GIFPicker/GIFPicker'


const EmojiPicker = lazy(() => import('@/components/common/EmojiPicker/EmojiPicker'))

type RightToolbarButtonsProps = {
    fileProps?: ToolbarFileProps,
    sendMessage: (html: string, json: any) => Promise<void>,
    messageSending: boolean,
    setContent: (content: string) => void
}
/**
 * Component to render the right toolbar buttons:
 * 1. User Mention
 * 2. Channel Mention
 * 3. Emoji picker
 * 4. File upload
 * 5. Send button
 * @param props
 * @returns
 */
export const RightToolbarButtons = ({ fileProps, ...sendProps }: RightToolbarButtonsProps) => {
    return (
        <Flex gap='2' align='center' px='1' py='1'>
            <MentionButtons />
            <Separator orientation='vertical' />
            <Flex gap='3' align='center'>
                <EmojiPickerButton />
                <GIFPickerButton />
                {fileProps && <FilePickerButton fileProps={fileProps} />}
                <SendButton {...sendProps} />
            </Flex>
        </Flex>
    )
}

const MentionButtons = () => {
    const { editor } = useCurrentEditor()

    if (!editor) {
        return null
    }

    return <Flex gap='3'>
        <IconButton
            onClick={() => editor.chain().focus().insertContent('#').run()}
            aria-label='mention channel'
            title='Mention a channel'
            className={DEFAULT_BUTTON_STYLE}
            variant='ghost'
            size='1'
            disabled={
                !editor.can()
                    .chain()
                    .focus()
                    .insertContent('#')
                    .run() || !editor.isEditable
            }>
            <BiHash {...ICON_PROPS} />
        </IconButton>
        <IconButton
            onClick={() => editor.chain().focus().insertContent('@').run()}
            aria-label='mention user'
            variant='ghost'
            className={DEFAULT_BUTTON_STYLE}
            size='1'
            title='Mention a user'
            disabled={
                !editor.can()
                    .chain()
                    .focus()
                    .insertContent('@')
                    .run() || !editor.isEditable
            }>
            <BiAt {...ICON_PROPS} />
        </IconButton>
    </Flex>
}


const EmojiPickerButton = () => {
    const { editor } = useCurrentEditor()

    if (!editor) {
        return null
    }

    return <Popover.Root>
        <Popover.Trigger>
            <IconButton
                size='1'
                variant='ghost'
                className={DEFAULT_BUTTON_STYLE}
                title='Add emoji'
                disabled={!editor.can().chain().focus().insertContent('😅').run() || !editor.isEditable}
                aria-label={"add emoji"}>
                <BiSmile {...ICON_PROPS} />
            </IconButton>
        </Popover.Trigger>
        <Popover.Content>
            <Inset>
                <Suspense fallback={<Loader />}>
                    <EmojiPicker onSelect={(e) => editor.chain().focus().insertContent(e).run()} />
                </Suspense>
            </Inset>
        </Popover.Content>
    </Popover.Root>
}

const GIFPickerButton = () => {

    const { editor } = useCurrentEditor()

    if (!editor) {
        return null
    }

    return <Popover.Root>
        <Popover.Trigger>
            <IconButton
                size='1'
                variant='ghost'
                className={DEFAULT_BUTTON_STYLE}
                title='Add GIF'
                // disabled
                aria-label={"add GIF"}>
                <HiOutlineGif {...ICON_PROPS} />
            </IconButton>
        </Popover.Trigger>
        <Popover.Content>
            <Inset>
                <Suspense fallback={<Loader />}>
                    {/* FIXME: 1. Handle 'HardBreak' coz it adds newline (empty); and if user doesn't write any text, then newline is added as text content.
                               2. Also if you write first & then add GIF there's no 'HardBreak'.
                    */}
                    <GIFPicker onSelect={(gif) => editor.chain().focus().setImage({ src: gif.media_formats.gif.url }).setHardBreak().run()} />
                </Suspense>
            </Inset>
        </Popover.Content>
    </Popover.Root>
}

const FilePickerButton = ({ fileProps }: { fileProps: ToolbarFileProps }) => {
    const { editor } = useCurrentEditor()
    const fileButtonClicked = () => {
        if (fileProps.fileInputRef?.current) {
            fileProps.fileInputRef?.current.openFileInput()
        }
    }

    return <IconButton
        size='1'
        onClick={fileButtonClicked}
        variant='ghost'
        className={DEFAULT_BUTTON_STYLE}
        disabled={editor?.isEditable === false}
        title='Attach file'
        aria-label={"attach file"}>
        <BiPaperclip {...ICON_PROPS} />
    </IconButton>
}


const SendButton = ({ sendMessage, messageSending, setContent }: {
    sendMessage: RightToolbarButtonsProps['sendMessage'],
    messageSending: boolean,
    setContent: RightToolbarButtonsProps['setContent']
}) => {
    const { editor } = useCurrentEditor()
    const onClick = () => {
        if (editor) {


            const hasContent = editor.getText().trim().length > 0

            console.log("Editor content: ", editor.getJSON())

            const hasInlineImage = editor.getHTML().includes('img')

            let html = ''
            let json = {}
            if (hasContent || hasInlineImage) {
                html = editor.getHTML()
                json = editor.getJSON()
            }
            editor.setEditable(false)
            sendMessage(html, json)
                .then(() => {
                    setContent('')
                    editor.chain().focus().clearContent(true).run()
                    editor.setEditable(true)
                })
                .catch(() => {
                    editor.setEditable(true)
                })
        }
    }

    return <IconButton
        aria-label='send message'
        title='Send message'
        variant='ghost'
        size='1'
        onClick={onClick}
    >
        {messageSending ? <Loader /> :
            <BiSolidSend {...ICON_PROPS} />
        }
    </IconButton>
}