import { HStack, Icon, Link, Text, useDisclosure } from "@chakra-ui/react"
import { getFileExtensionIcon } from "../../../../utils/layout/fileExtensionIcon"
import { FilePreviewModal } from "../../file-preview/FilePreviewModal"

interface FileMessageProps {
    file: string,
    owner: string,
    timestamp: Date
}

export const FileMessage = ({ file, owner, timestamp }: FileMessageProps) => {

    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <HStack>
            <Icon as={getFileExtensionIcon(file.split('.')[1])} />
            {file.split('.')[1].toLowerCase() === 'pdf' ?
                <Text onClick={onOpen} _hover={{ cursor: 'pointer', textDecoration: 'underline' }}>{file.split('/')[3]}</Text> :
                <Text as={Link} href={file} isExternal>{file.split('/')[3]}</Text>
            }
            <FilePreviewModal
                isOpen={isOpen}
                onClose={onClose}
                file_url={file}
                file_owner={owner}
                timestamp={timestamp}
                message_type={"File"} />
        </HStack>
    )
}