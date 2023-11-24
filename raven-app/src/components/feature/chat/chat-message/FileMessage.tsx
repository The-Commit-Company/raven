import { Collapse, HStack, Icon, IconButton, Link, Stack, Text, useBoolean, Image } from "@chakra-ui/react"
import { getFileExtensionIcon } from "../../../../utils/layout/fileExtensionIcon"
import { FileMessage } from "../../../../../../types/Messaging/Message"
import { useCallback } from "react"
import { BsFillCaretDownFill, BsFillCaretRightFill } from "react-icons/bs"
import { getFileExtension, getFileName } from "../../../../utils/operations"

interface FileMessageProps extends Partial<FileMessage> {
    onFilePreviewModalOpen: ({ file, owner, creation, message_type }: Partial<FileMessage>) => void
}

export const FileMessageBlock = ({ file, owner, creation, message_type, onFilePreviewModalOpen }: FileMessageProps) => {

    const [showImage, { toggle }] = useBoolean(true)

    const openFile = useCallback(() => {
        onFilePreviewModalOpen({
            file,
            owner,
            creation,
            message_type
        })
    }, [file, owner, creation, message_type])

    if (message_type === 'File' && file) {
        return (
            <HStack>
                <div slot='start'>
                    {getFileExtensionIcon(getFileExtension(file))}
                </div>
                {getFileExtension(file).toLowerCase() === 'pdf'
                    ?
                    <Text
                        onClick={openFile}
                        _hover={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        {getFileName(file)}
                    </Text>
                    :
                    <Text as={Link} href={file} isExternal>{getFileName(file)}</Text>
                }
            </HStack>
        )
    }

    if (message_type === 'Image' && file) {
        return (
            <Stack spacing={0}>
                <HStack spacing={1}>
                    {<Text fontSize={'sm'} color={'gray.500'}>{getFileName(file)}</Text>}
                    <IconButton aria-label={"view"} size='xs' onClick={toggle} variant={'unstyled'}
                        icon={showImage ? <BsFillCaretDownFill fontSize={'0.6rem'} /> : <BsFillCaretRightFill fontSize={'0.6rem'} />} />
                </HStack>
                <Collapse in={showImage} animateOpacity>
                    <Image src={file} height='360px' rounded={'md'}
                        onClick={openFile}
                        _hover={{ cursor: 'pointer' }} objectFit='cover' />
                </Collapse>
            </Stack>
        )
    }

    return null
}