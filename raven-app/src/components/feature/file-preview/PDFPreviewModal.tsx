import { Text, Avatar, Button, HStack, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, StackDivider, useColorMode } from "@chakra-ui/react"
import { useContext } from "react"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { DateObjectToTimeString } from "../../../utils/operations"
import { BsDownload } from "react-icons/bs"

interface PDFPreviewProps {
    isOpen: boolean,
    onClose: () => void,
    file_url: string,
    file_owner: string,
    timestamp: Date
}

export const PDFPreviewModal = ({ isOpen, onClose, file_url, file_owner, timestamp }: PDFPreviewProps) => {

    const { channelMembers } = useContext(ChannelContext)
    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'gray.800' : 'gray.50'

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='6xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <HStack spacing={2} alignItems='center'>
                        <Avatar name={channelMembers?.[file_owner]?.full_name ?? file_owner} src={channelMembers?.[file_owner]?.user_image} borderRadius={'md'} boxSize='40px' />
                        <Stack spacing={1}>
                            <HStack divider={<StackDivider borderColor="gray.200" />} spacing={2} alignItems='center'>
                                <Text fontSize='md' lineHeight={'0.9'} fontWeight="bold" as='span' color={textColor}>{channelMembers?.[file_owner]?.full_name ?? file_owner}</Text>
                                <Text fontSize="xs" lineHeight={'0.9'} color="gray.500">{DateObjectToTimeString(timestamp)}</Text>
                            </HStack>
                            <Text fontSize='xs'>File: "{file_url.split('/')[3]}"</Text>
                        </Stack>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <iframe src={file_url} width="100%" height={'550px'} />
                </ModalBody>

                <ModalFooter>
                    <Button
                        as={Link}
                        href={file_url}
                        isExternal
                        aria-label="download file"
                        size='xs'
                        rightIcon={<BsDownload />}>
                        Download
                    </Button>
                </ModalFooter>

            </ModalContent>
        </Modal>
    )
}