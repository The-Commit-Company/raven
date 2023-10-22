import { ButtonGroup, HStack, IconButton, Popover, PopoverContent, PopoverTrigger, StackDivider } from '@chakra-ui/react'
import { useCurrentEditor } from '@tiptap/react'
import { BiAt, BiHash, BiSend, BiSmile } from 'react-icons/bi'
import { ICON_PROPS } from './ToolPanel'
import { EmojiPicker } from '../../../common/EmojiPicker/EmojiPicker'
import { ToolbarFileProps } from './Tiptap'
import { AiOutlinePaperClip } from 'react-icons/ai'

type RightToolbarButtonsProps = {
    fileProps?: ToolbarFileProps,
    sendMessage: (html: string, json: any) => Promise<void>,
    messageSending: boolean
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
        <HStack divider={<StackDivider />}>
            <MentionButtons />
            <ButtonGroup size='xs' variant={'ghost'}>
                <EmojiPickerButton />
                {fileProps && <FilePickerButton fileProps={fileProps} />}
                <SendButton {...sendProps} />
            </ButtonGroup>
        </HStack>
    )
}

const MentionButtons = () => {
    const { editor } = useCurrentEditor()

    if (!editor) {
        return null
    }

    return <ButtonGroup size='xs' variant={'ghost'}>
        <IconButton
            onClick={() => editor.chain().focus().insertContent('#').run()}
            aria-label='mention channel'
            title='Mention a channel'
            icon={<BiHash {...ICON_PROPS} />}
            isDisabled={
                !editor.can()
                    .chain()
                    .focus()
                    .insertContent('#')
                    .run() || !editor.isEditable
            } />
        <IconButton
            onClick={() => editor.chain().focus().insertContent('@').run()}
            aria-label='mention user'
            title='Mention a user'
            icon={<BiAt {...ICON_PROPS} />}
            isDisabled={
                !editor.can()
                    .chain()
                    .focus()
                    .insertContent('@')
                    .run() || !editor.isEditable
            } />
    </ButtonGroup>
}


const EmojiPickerButton = () => {
    const { editor } = useCurrentEditor()

    if (!editor) {
        return null
    }

    return <Popover
        placement='top-end'
        isLazy
    >
        <PopoverTrigger>
            <IconButton
                size='xs'
                variant='ghost'
                title='Add emoji'
                isDisabled={!editor.can().chain().focus().insertContent('😅').run() || !editor.isEditable}
                aria-label={"add emoji"} icon={<BiSmile {...ICON_PROPS} />} />
        </PopoverTrigger>
        <PopoverContent border={'none'} rounded='lg' mr='4' shadow={'md'}>
            <EmojiPicker onSelect={(e) => editor.chain().focus().insertContent(e).run()} />
        </PopoverContent>
    </Popover>
}

const FilePickerButton = ({ fileProps }: { fileProps: ToolbarFileProps }) => {
    const { editor } = useCurrentEditor()
    const fileButtonClicked = () => {
        if (fileProps.fileInputRef?.current) {
            fileProps.fileInputRef?.current.openFileInput()
        }
    }

    return <IconButton
        size='xs'
        onClick={fileButtonClicked}
        variant='ghost'
        isDisabled={editor?.isEditable === false}
        title='Attach file'
        aria-label={"attach file"} icon={<AiOutlinePaperClip {...ICON_PROPS} />} />
}


const SendButton = ({ sendMessage, messageSending }: {
    sendMessage: RightToolbarButtonsProps['sendMessage'],
    messageSending: boolean
}) => {
    const { editor } = useCurrentEditor()
    const onClick = () => {
        if (editor) {

            // console.log('editor.isActive', editor.state)

            // console.log(editor.getJSON())


            const hasContent = editor.getText().trim().length > 0

            let html = ''
            let json = {}
            if (hasContent) {
                html = editor.getHTML()
                json = editor.getJSON()
            }

            console.log("Will send a message")
            editor.setEditable(false)
            sendMessage(html, json)
                .then(() => {
                    editor.chain().focus().clearContent().run()
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
        isLoading={messageSending}
        onClick={onClick}
        icon={<BiSend {...ICON_PROPS} />}
    />
}