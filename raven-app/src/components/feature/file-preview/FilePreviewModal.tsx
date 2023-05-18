import { Avatar, Button, Center, HStack, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, StackDivider, Text, useColorMode } from "@chakra-ui/react"
import { DateObjectToTimeString } from "../../../utils/operations"
import { useContext } from "react"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { BsDownload } from "react-icons/bs"
import ReactPanZoom from "react-image-pan-zoom-rotate"

interface FilePreviewModalProps {
    isOpen: boolean,
    onClose: () => void,
    file_url: string,
    file_owner: string,
    timestamp: Date,
    message_type: 'File' | 'Image'
}

export const FilePreviewModal = ({ isOpen, onClose, file_url, file_owner, timestamp, message_type }: FilePreviewModalProps) => {

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
                    {message_type === 'Image' && <Center>
                        <div
                            style={{
                                width: '40vw',
                                position: "relative",
                                overflow: "hidden"
                            }}>
                            <ReactPanZoom
                                alt="uploaded image"
                                image={file_url}
                            />
                        </div>
                    </Center>
                    }
                    {message_type === 'File' && <iframe src={file_url} width="100%" height={'550px'} />}
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