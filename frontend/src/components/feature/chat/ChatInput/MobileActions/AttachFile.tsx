import { DropdownMenu, Flex } from '@radix-ui/themes'
import { useCurrentEditor } from '@tiptap/react'
import { BiPaperclip } from 'react-icons/bi'
import { ToolbarFileProps } from '../Tiptap'

const AttachFile = ({ fileProps }: { fileProps: ToolbarFileProps }) => {
    const { editor } = useCurrentEditor()
    const fileButtonClicked = () => {
        if (fileProps.fileInputRef?.current) {
            fileProps.fileInputRef?.current.openFileInput()
        }
    }
    return (
        <DropdownMenu.Item onClick={fileButtonClicked} disabled={editor?.isEditable === false} className='text-base !h-10'>
            <Flex gap='2' className='items-center'>
                <BiPaperclip />
                File
            </Flex>
        </DropdownMenu.Item>
    )
}

export default AttachFile