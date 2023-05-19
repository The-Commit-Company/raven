import { HStack, Icon, Link, Text } from "@chakra-ui/react"
import { getFileExtensionIcon } from "../../../../utils/layout/fileExtensionIcon"
import { Message } from "../../../../types/Messaging/Message"

interface FileMessageProps {
    message: Message,
    onFilePreviewModalOpen: (message: Message) => void
}

export const FileMessage = ({ message, onFilePreviewModalOpen }: FileMessageProps) => {
    return (
        <HStack>
            {message.file && <Icon as={getFileExtensionIcon(message.file.split('.')[1])} />}
            {message && message.file ?
                message.file.split('.')[1].toLowerCase() === 'pdf'
                    ?
                    <Text
                        onClick={() => onFilePreviewModalOpen(message)}
                        _hover={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        {message.file.split('/')[3]}
                    </Text>
                    :
                    <Text as={Link} href={message.file} isExternal>{message.file.split('/')[3]}</Text>
                :
                <Text>File not found</Text>
            }
        </HStack>
    )
}