import { Flex, IconButton, IconButtonProps } from '@radix-ui/themes'
import { useCurrentEditor } from '@tiptap/react'
import { BiAt, BiHash, BiPaperclip } from 'react-icons/bi'
import { HiOutlineGif } from 'react-icons/hi2'
import { MdOutlineBarChart } from 'react-icons/md'

export const ICON_PROPS = {
    size: '22'
}

export const DEFAULT_BUTTON_STYLE = 'bg-transparent dark:text-gray-10'

const DEFAULT_PROPS: Partial<IconButtonProps> = {
    size: '3',
    variant: 'ghost',
    color: 'gray',
    className: DEFAULT_BUTTON_STYLE
}

type Props = {
    onFileClick?: () => void

}

const MessageInputActions = ({ onFileClick }: Props) => {
    return (
        <Flex align='center' gap='4' px='2'>
            <FilePickerButton {...DEFAULT_PROPS} onClick={onFileClick} />
            <MentionButtons {...DEFAULT_PROPS} />
            {/* <PollButton {...DEFAULT_PROPS} /> */}
            {/* <GIFPickerButton {...DEFAULT_PROPS} /> */}
        </Flex>
    )
}

const MentionButtons = (props: IconButtonProps) => {
    const { editor } = useCurrentEditor()

    if (!editor) {
        return null
    }

    return <Flex gap='4'>

        <IconButton
            onClick={() => editor.chain().focus().insertContent('@').run()}
            aria-label='mention user'
            title='Mention a user'
            disabled={
                !editor.can()
                    .chain()
                    .focus()
                    .insertContent('@')
                    .run() || !editor.isEditable
            }
            {...props}
        >
            <BiAt {...ICON_PROPS} />
        </IconButton>

        <IconButton
            onClick={() => editor.chain().focus().insertContent('#').run()}
            aria-label='mention channel'
            title='Mention a channel'
            disabled={
                !editor.can()
                    .chain()
                    .focus()
                    .insertContent('#')
                    .run() || !editor.isEditable
            }
            {...props}
        >
            <BiHash {...ICON_PROPS} />
        </IconButton>
    </Flex>
}


const GIFPickerButton = (props: IconButtonProps) => {

    const { editor } = useCurrentEditor()

    if (!editor) {
        return null
    }

    return <IconButton
        title='Add GIF'
        aria-label={"add GIF"}
        {...props}
    >
        <HiOutlineGif {...ICON_PROPS} />
    </IconButton>
}

const FilePickerButton = (props: IconButtonProps) => {

    return <IconButton
        title='Attach a file'
        aria-label='Attach a file'
        {...props}
    >
        <BiPaperclip {...ICON_PROPS} />
    </IconButton>

}

const PollButton = (props: IconButtonProps) => {

    return <IconButton
        title='Create a poll'
        aria-label='Create a poll'
        {...props}
    >
        <MdOutlineBarChart {...ICON_PROPS} />
    </IconButton>

}

export default MessageInputActions