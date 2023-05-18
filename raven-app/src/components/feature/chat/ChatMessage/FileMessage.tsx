import { HStack, Icon, Link, Text } from "@chakra-ui/react"
import { getFileExtensionIcon } from "../../../../utils/layout/fileExtensionIcon"

interface FileMessageProps {
    file: string,
    onFilePreviewModalOpen: () => void
}

export const FileMessage = ({ file, onFilePreviewModalOpen }: FileMessageProps) => {

    return (
        <HStack>
            <Icon as={getFileExtensionIcon(file.split('.')[1])} />
            {file.split('.')[1].toLowerCase() === 'pdf' ?
                <Text onClick={onFilePreviewModalOpen} _hover={{ cursor: 'pointer', textDecoration: 'underline' }}>{file.split('/')[3]}</Text> :
                <Text as={Link} href={file} isExternal>{file.split('/')[3]}</Text>
            }
        </HStack>
    )
}