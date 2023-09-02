import { Tooltip, IconButton } from "@chakra-ui/react"
import { RefObject } from "react"
import { VscMention } from "react-icons/vsc"
import ReactQuill from "react-quill"

export const MentionButton = (reactQuillRef: RefObject<ReactQuill>) => {

    const onMentionIconClick = () => {
        if (reactQuillRef.current) {
            const editor = reactQuillRef.current?.getEditor()
            editor.getModule('mention').openMenu("@")
        }
    }

    return (
        <Tooltip hasArrow label='mention someone' placement='top' rounded={'md'}>
            <IconButton
                size='xs'
                variant='ghost'
                aria-label={"mention channel member"}
                icon={<VscMention fontSize='1.5rem' />}
                onClick={onMentionIconClick} />
        </Tooltip>
    )
}