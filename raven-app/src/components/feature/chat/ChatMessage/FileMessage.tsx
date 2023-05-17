import { HStack, Icon, Link, Text, useDisclosure } from "@chakra-ui/react"
import { getFileExtensionIcon } from "../../../../utils/layout/fileExtensionIcon"
import { PDFPreviewModal } from "../../file-preview/PDFPreviewModal"
import { useContext } from "react"
import { ChannelContext } from "../../../../utils/channel/ChannelProvider"

interface FileMessageProps {
    file: string,
    user: string,
    timestamp: Date
}

export const FileMessage = ({ file, user, timestamp }: FileMessageProps) => {

    const { channelMembers } = useContext(ChannelContext)
    const { isOpen: isPDFPreviewModalOpen, onOpen: onPDFPreviewModalOpen, onClose: onPDFPreviewModalClose } = useDisclosure()

    return (
        <>
            <HStack>
                <Icon as={getFileExtensionIcon(file.split('.')[1])} />
                {file.split('.')[1].toLowerCase() === 'pdf' ?
                    <Text onClick={onPDFPreviewModalOpen} _hover={{ cursor: 'pointer', textDecoration: 'underline' }}>{file.split('/')[3]}</Text> :
                    <Text as={Link} href={file} isExternal>{file.split('/')[3]}</Text>
                }
            </HStack>
            <PDFPreviewModal isOpen={isPDFPreviewModalOpen} onClose={onPDFPreviewModalClose} file_owner={channelMembers?.[user]?.name} file_url={file} timestamp={timestamp} />
        </>
    )
}