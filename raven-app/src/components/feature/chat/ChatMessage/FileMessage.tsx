import { Collapse, HStack, Icon, IconButton, Link, Stack, Text, useBoolean, Image } from "@chakra-ui/react"
import { getFileExtensionIcon } from "../../../../utils/layout/fileExtensionIcon"
import { FileMessage } from "../../../../types/Messaging/Message"
import { useCallback, useMemo } from "react"
import { BsFillCaretDownFill, BsFillCaretRightFill } from "react-icons/bs"

interface FileMessageProps extends FileMessage {
    onFilePreviewModalOpen: ({ file, owner, creation }: Partial<FileMessage>) => void
}

export const FileMessageBlock = ({ file, owner, creation, message_type, onFilePreviewModalOpen }: FileMessageProps) => {

    const [showImage, { toggle }] = useBoolean(true)

    const openFile = useCallback(() => {
        onFilePreviewModalOpen({
            file,
            owner,
            creation
        })
    }, [file, owner, creation])

    const fileName = useMemo(() => {
        return file.split('/')[3]
    }, [file])

    if (message_type === 'File') {
        return (
            <HStack>
                <Icon as={getFileExtensionIcon(file.split('.')[1])} />
                {file.split('.')[1].toLowerCase() === 'pdf'
                    ?
                    <Text
                        onClick={openFile}
                        _hover={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        {fileName}
                    </Text>
                    :
                    <Text as={Link} href={file} isExternal>{fileName}</Text>
                }
            </HStack>
        )
    }

    if (message_type === 'Image') {
        return (
            <Stack spacing={0}>
                <HStack spacing={1}>
                    {<Text fontSize={'sm'} color={'gray.500'}>{fileName}</Text>}
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