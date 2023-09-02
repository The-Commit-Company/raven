import { Tooltip, IconButton } from "@chakra-ui/react"
import { useRef } from "react"
import { IoMdAdd } from "react-icons/io"

type Props = {
    fileInputRef: React.MutableRefObject<any>
}

export const ChatInputFileUploadButton = ({ fileInputRef }: Props) => {

    const fileButtonClicked = () => {
        if (fileInputRef.current) {
            fileInputRef.current.openFileInput()
        }
    }

    return (
        <Tooltip hasArrow label='add files' placement='top' rounded={'md'}>
            <IconButton size='xs' aria-label={"add file"} onClick={fileButtonClicked} icon={<IoMdAdd />} rounded='xl' />
        </Tooltip>
    )
}